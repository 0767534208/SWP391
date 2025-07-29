import * as signalR from '@microsoft/signalr';
import { STORAGE_KEYS } from '../config/constants';

class QnASignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private messageCallbacks: ((questionId: number, message: any) => void)[] = [];
  private connectionEstablishedCallbacks: (() => void)[] = [];
  private connectionErrorCallbacks: ((error: Error) => void)[] = [];

  /**
   * Initialize the SignalR connection to the QnA hub
   */
  public async startConnection(apiBaseUrl: string): Promise<boolean> {
    try {
      // Get the authentication token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      // Create the connection
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiBaseUrl}/qnaHub`, {
          accessTokenFactory: () => token || ''
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up message handler
      this.hubConnection.on('ReceiveMessage', (questionId: number, message: any) => {
        console.log('SignalR received message:', message, 'for question:', questionId);
        this.messageCallbacks.forEach(callback => callback(questionId, message));
      });

      // Start the connection
      await this.hubConnection.start();
      console.log('SignalR connection established successfully.');
      
      // Notify listeners that connection is established
      this.connectionEstablishedCallbacks.forEach(callback => callback());
      
      return true;
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      
      // Notify listeners about connection error
      if (error instanceof Error) {
        this.connectionErrorCallbacks.forEach(callback => callback(error));
      }
      
      return false;
    }
  }

  /**
   * Join a specific question room to receive updates
   */
  public async joinQuestionRoom(questionId: number): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinQuestionGroup', questionId);
        console.log(`Joined question room for question ID: ${questionId}`);
      } catch (error) {
        console.error(`Error joining question room for question ID: ${questionId}`, error);
      }
    } else {
      console.warn('Cannot join question room - SignalR connection not established');
    }
  }

  /**
   * Leave a specific question room
   */
  public async leaveQuestionRoom(questionId: number): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('LeaveQuestionGroup', questionId);
        console.log(`Left question room for question ID: ${questionId}`);
      } catch (error) {
        console.error(`Error leaving question room for question ID: ${questionId}`, error);
      }
    }
  }

  /**
   * Register a callback function to be called when a new message is received
   */
  public onMessageReceived(callback: (questionId: number, message: any) => void): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Register a callback function to be called when the connection is established
   */
  public onConnectionEstablished(callback: () => void): void {
    this.connectionEstablishedCallbacks.push(callback);
  }

  /**
   * Register a callback function to be called when there's a connection error
   */
  public onConnectionError(callback: (error: Error) => void): void {
    this.connectionErrorCallbacks.push(callback);
  }

  /**
   * Stop the SignalR connection
   */
  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR connection stopped.');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  /**
   * Check if the connection is active
   */
  public isConnected(): boolean {
    return !!this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected;
  }
}

// Create singleton instance
const qnaSignalRService = new QnASignalRService();
export default qnaSignalRService;
