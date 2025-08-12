import { NotificationManager, NotificationOptions } from '../src/core/NotificationManager';

// Mock node-notifier
jest.mock('node-notifier', () => {
  return {
    notify: jest.fn((options, callback) => {
      // By default, call the callback with no error
      callback(null);
    }),
  };
});

import * as notifier from 'node-notifier';

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of NotificationManager for each test
    notificationManager = new NotificationManager();
  });

  it('should send a notification with default options', async () => {
    const options: NotificationOptions = {
      title: 'Test Notification',
      message: 'This is a test message',
    };

    const result = await notificationManager.sendNotification(options);

    expect(result).toBe(true);
    expect(notifier.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Notification',
        message: 'This is a test message',
      }),
      expect.any(Function)
    );
  });

  it('should send a notification with custom options', async () => {
    const options: NotificationOptions = {
      title: 'Custom Notification',
      message: 'This is a custom message',
      urgency: 'critical',
      timeout: 20,
      sound: false,
    };

    const result = await notificationManager.sendNotification(options);

    expect(result).toBe(true);
    expect(notifier.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Custom Notification',
        message: 'This is a custom message',
      }),
      expect.any(Function)
    );
  });

  it('should return false when notification fails', async () => {
    // Mock the notify function to call the callback with an error
    (notifier.notify as jest.Mock).mockImplementationOnce((options, callback) => {
      callback(new Error('Notification failed'));
    });

    const options: NotificationOptions = {
      title: 'Failed Notification',
      message: 'This notification should fail',
    };

    const result = await notificationManager.sendNotification(options);

    expect(result).toBe(false);
  });
});