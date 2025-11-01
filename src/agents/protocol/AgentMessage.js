/**
 * AgentMessage Protocol
 * Standardized message format for agent-to-agent communication
 * Provides message tracking, validation, serialization, and retry logic
 */

import { randomUUID } from 'crypto';

class AgentMessage {
  // Message types
  static TYPE = {
    TASK: 'task',
    RESPONSE: 'response',
    ALERT: 'alert',
    HEARTBEAT: 'heartbeat',
    ERROR: 'error',
  };

  // Priority levels
  static PRIORITY = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  };

  // Status values
  static STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    TIMEOUT: 'timeout',
  };

  /**
   * Create a new AgentMessage
   * @param {Object} options - Message options
   * @param {string} options.sender - Sender agent name
   * @param {string} options.receiver - Receiver agent name
   * @param {string} options.type - Message type (from AgentMessage.TYPE)
   * @param {Object} options.data - Message payload
   * @param {string} [options.priority] - Message priority (default: MEDIUM)
   * @param {number} [options.timeout] - Timeout in milliseconds (default: 30000)
   * @param {string} [options.correlationId] - ID to correlate with previous message
   */
  constructor(options) {
    this.validateOptions(options);

    this.id = randomUUID();
    this.sender = options.sender;
    this.receiver = options.receiver;
    this.type = options.type;
    this.data = options.data || {};
    this.priority = options.priority || AgentMessage.PRIORITY.MEDIUM;
    this.status = AgentMessage.STATUS.PENDING;
    this.correlationId = options.correlationId || null;
    this.timestamp = new Date().toISOString();
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.retryCount = 0;
    this.maxRetries = 3;
    this.error = null;
    this.processedAt = null;
    this.completedAt = null;
  }

  /**
   * Validate message options
   * @param {Object} options - Options to validate
   * @throws {Error} If validation fails
   */
  validateOptions(options) {
    if (!options.sender || typeof options.sender !== 'string') {
      throw new Error('Message must have a valid sender');
    }

    if (!options.receiver || typeof options.receiver !== 'string') {
      throw new Error('Message must have a valid receiver');
    }

    if (!options.type || !Object.values(AgentMessage.TYPE).includes(options.type)) {
      throw new Error(
        `Invalid message type. Must be one of: ${Object.values(AgentMessage.TYPE).join(', ')}`
      );
    }

    if (options.priority && !Object.values(AgentMessage.PRIORITY).includes(options.priority)) {
      throw new Error(
        `Invalid priority. Must be one of: ${Object.values(AgentMessage.PRIORITY).join(', ')}`
      );
    }

    if (options.timeout && (typeof options.timeout !== 'number' || options.timeout <= 0)) {
      throw new Error('Timeout must be a positive number');
    }
  }

  /**
   * Mark message as processing
   */
  markProcessing() {
    this.status = AgentMessage.STATUS.PROCESSING;
    this.processedAt = new Date().toISOString();
  }

  /**
   * Mark message as completed
   * @param {Object} result - Result data
   */
  markCompleted(result) {
    this.status = AgentMessage.STATUS.COMPLETED;
    this.completedAt = new Date().toISOString();
    this.data.result = result;
  }

  /**
   * Mark message as failed
   * @param {Error|string} error - Error information
   */
  markFailed(error) {
    this.status = AgentMessage.STATUS.FAILED;
    this.completedAt = new Date().toISOString();
    this.error = error instanceof Error ? error.message : error;
  }

  /**
   * Mark message as timeout
   */
  markTimeout() {
    this.status = AgentMessage.STATUS.TIMEOUT;
    this.completedAt = new Date().toISOString();
    this.error = 'Message processing timeout';
  }

  /**
   * Check if message has timed out
   * @returns {boolean} True if message has timed out
   */
  hasTimedOut() {
    if (
      this.status === AgentMessage.STATUS.COMPLETED ||
      this.status === AgentMessage.STATUS.FAILED
    ) {
      return false;
    }

    const now = Date.now();
    const messageTime = new Date(this.timestamp).getTime();
    return now - messageTime > this.timeout;
  }

  /**
   * Check if message can be retried
   * @returns {boolean} True if retry is allowed
   */
  canRetry() {
    return this.status === AgentMessage.STATUS.FAILED && this.retryCount < this.maxRetries;
  }

  /**
   * Increment retry count and reset for retry
   * @returns {boolean} True if retry was successful
   */
  retry() {
    if (!this.canRetry()) {
      return false;
    }

    this.retryCount++;
    this.status = AgentMessage.STATUS.PENDING;
    this.error = null;
    this.processedAt = null;
    this.completedAt = null;
    this.timestamp = new Date().toISOString();

    return true;
  }

  /**
   * Calculate exponential backoff delay for retry
   * @returns {number} Delay in milliseconds
   */
  getRetryDelay() {
    const baseDelay = 2000; // 2 seconds
    return baseDelay * 2 ** this.retryCount;
  }

  /**
   * Create a response message to this message
   * @param {string} senderName - Name of the responding agent
   * @param {Object} responseData - Response data
   * @returns {AgentMessage} New response message
   */
  createResponse(senderName, responseData) {
    return new AgentMessage({
      sender: senderName,
      receiver: this.sender,
      type: AgentMessage.TYPE.RESPONSE,
      data: responseData,
      priority: this.priority,
      correlationId: this.id,
    });
  }

  /**
   * Create an error response to this message
   * @param {string} senderName - Name of the responding agent
   * @param {Error|string} error - Error information
   * @returns {AgentMessage} New error message
   */
  createErrorResponse(senderName, error) {
    return new AgentMessage({
      sender: senderName,
      receiver: this.sender,
      type: AgentMessage.TYPE.ERROR,
      data: {
        originalMessageId: this.id,
        error: error instanceof Error ? error.message : error,
        originalData: this.data,
      },
      priority: AgentMessage.PRIORITY.HIGH,
      correlationId: this.id,
    });
  }

  /**
   * Serialize message to JSON
   * @returns {string} JSON string
   */
  toJSON() {
    return JSON.stringify({
      id: this.id,
      sender: this.sender,
      receiver: this.receiver,
      type: this.type,
      data: this.data,
      priority: this.priority,
      status: this.status,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      timeout: this.timeout,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      error: this.error,
      processedAt: this.processedAt,
      completedAt: this.completedAt,
    });
  }

  /**
   * Serialize message to plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      sender: this.sender,
      receiver: this.receiver,
      type: this.type,
      data: this.data,
      priority: this.priority,
      status: this.status,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      timeout: this.timeout,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      error: this.error,
      processedAt: this.processedAt,
      completedAt: this.completedAt,
    };
  }

  /**
   * Create AgentMessage from JSON string
   * @param {string} jsonString - JSON string
   * @returns {AgentMessage} AgentMessage instance
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    return AgentMessage.fromObject(data);
  }

  /**
   * Create AgentMessage from plain object
   * @param {Object} obj - Plain object
   * @returns {AgentMessage} AgentMessage instance
   */
  static fromObject(obj) {
    const message = new AgentMessage({
      sender: obj.sender,
      receiver: obj.receiver,
      type: obj.type,
      data: obj.data,
      priority: obj.priority,
      timeout: obj.timeout,
      correlationId: obj.correlationId,
    });

    // Restore state
    message.id = obj.id;
    message.status = obj.status;
    message.timestamp = obj.timestamp;
    message.retryCount = obj.retryCount;
    message.maxRetries = obj.maxRetries;
    message.error = obj.error;
    message.processedAt = obj.processedAt;
    message.completedAt = obj.completedAt;

    return message;
  }

  /**
   * Get message age in milliseconds
   * @returns {number} Age in milliseconds
   */
  getAge() {
    return Date.now() - new Date(this.timestamp).getTime();
  }

  /**
   * Get processing duration in milliseconds
   * @returns {number|null} Duration or null if not processed
   */
  getProcessingDuration() {
    if (!this.processedAt) return null;
    if (!this.completedAt) {
      return Date.now() - new Date(this.processedAt).getTime();
    }
    return new Date(this.completedAt).getTime() - new Date(this.processedAt).getTime();
  }

  /**
   * Check if message is a response to another message
   * @returns {boolean} True if this is a response message
   */
  isResponse() {
    return this.type === AgentMessage.TYPE.RESPONSE || this.type === AgentMessage.TYPE.ERROR;
  }

  /**
   * Get a human-readable summary of the message
   * @returns {string} Message summary
   */
  getSummary() {
    const duration = this.getProcessingDuration();
    const age = this.getAge();

    return `Message ${this.id} [${this.type}] from ${this.sender} to ${this.receiver} - Status: ${this.status}, Priority: ${this.priority}, Age: ${age}ms${duration ? `, Duration: ${duration}ms` : ''}`;
  }
}

export default AgentMessage;
