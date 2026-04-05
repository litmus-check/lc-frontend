import { useState, useRef, useEffect } from 'react';

interface UseWebSocketStreamReturn {
  websocket: WebSocket | null;
  currentImage: string | null;
  isConnecting: boolean;
  connectWebSocket: (composeId: string, websocketUrl: string, token: string) => Promise<WebSocket>;
  disconnectWebSocket: () => void;
  clearImage: () => void;
}

/**
 * Custom hook for managing WebSocket connection and image streaming for litmus cloud
 */
export const useWebSocketStream = (): UseWebSocketStreamReturn => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const websocketRef = useRef<WebSocket | null>(null);

  /**
   * Connect to WebSocket with compose id
   * @param composeId - The compose ID to connect with
   * @param websocketUrl - The base WebSocket URL
   * @param token - Bearer token for authentication (required)
   * @param maxRetries - Maximum number of connection retries (default: 5)
   * @param retryDelay - Initial delay between retries in ms (default: 1000)
   * @returns Promise that resolves when WebSocket is connected
   */
  const connectWebSocket = (
    composeId: string, 
    websocketUrl: string,
    token: string,
    maxRetries: number = 5,
    retryDelay: number = 1000
  ): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      // Validate required parameters
      if (!token) {
        setIsConnecting(false);
        reject(new Error('Bearer token is required for WebSocket connection'));
        return;
      }

      // Set connecting state to true
      setIsConnecting(true);
      
      // Close existing websocket if any
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }

      // Construct full websocket URL with compose id and token as query parameters

      const wsUrl = `${websocketUrl}?compose_id=${encodeURIComponent(composeId)}&token=${encodeURIComponent(token)}`;
      
      
      let attempt = 0;
      let connectionTimeout: NodeJS.Timeout | null = null;

      const tryConnect = (): void => {
        attempt++;
        console.log(`Attempting to connect WebSocket (attempt ${attempt}/${maxRetries}):`, {
          url: wsUrl,
          composeId: composeId,
        });

        const ws = new WebSocket(wsUrl);
        let isResolved = false;

        // Set connection timeout (10 seconds per attempt)
        connectionTimeout = setTimeout(() => {
          if (!isResolved) {
            ws.close();
            if (attempt < maxRetries) {
              const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
              console.log(`WebSocket connection timeout, retrying in ${delay}ms...`);
              setTimeout(tryConnect, delay);
            } else {
              setIsConnecting(false);
              reject(new Error(`WebSocket connection failed after ${maxRetries} attempts: ${wsUrl}`));
            }
          }
        }, 10000);

        ws.onopen = () => {
          if (isResolved) return;
          isResolved = true;
          setIsConnecting(false);
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          console.log('✅ WebSocket connected successfully', {
            composeId: composeId,
            url: wsUrl,
            attempt: attempt,
            readyState: ws.readyState,
            timestamp: new Date().toISOString()
          });
          websocketRef.current = ws;
          setWebsocket(ws);
          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            // Log detailed information about the received message
            const rawData = event.data;
            const dataType = typeof rawData;
            const dataLength = rawData?.length || (rawData instanceof Blob ? rawData.size : 0);
            const dataPreview = typeof rawData === 'string' 
              ? rawData.substring(0, 200) 
              : rawData instanceof Blob 
                ? `Blob(${rawData.size} bytes, type: ${rawData.type})`
                : String(rawData).substring(0, 200);
            
            console.log('📨 WebSocket message received', {
              composeId: composeId,
              dataType: dataType,
              dataLength: dataLength,
              dataPreview: dataPreview,
              isString: typeof rawData === 'string',
              isBlob: rawData instanceof Blob,
              isArrayBuffer: rawData instanceof ArrayBuffer,
              timestamp: new Date().toISOString()
            });
            
            if (rawData instanceof Blob) {
              // If binary data (Blob), it might be JSON text or binary image data
              // First try to read it as text to see if it's JSON
              console.log('Received Blob data, attempting to read as text first');
              const textReader = new FileReader();
              textReader.onloadend = () => {
                const textResult = textReader.result as string;
                if (textResult) {
                  try {
                    // Try to parse as JSON
                    const parsed = JSON.parse(textResult);
                    console.log('Blob contained JSON:', {
                      hasImage: !!parsed.image,
                      hasData: !!parsed.data,
                      hasSessionId: !!parsed.sessionId,
                      dataType: typeof parsed.data,
                      dataLength: parsed.data?.length || 0
                    });
                    
                    const imageData = parsed.image || parsed.data;
                    if (imageData) {
                      // Process the image data
                      let finalImageData = imageData.trim().replace(/\s/g, '');
                      
                      // Handle different data URL formats
                      if (finalImageData.startsWith('data:application/octet-stream;base64,')) {
                        const base64Data = finalImageData.split(',')[1];
                        finalImageData = `data:image/jpeg;base64,${base64Data}`;
                      } else if (!finalImageData.startsWith('data:image')) {
                        finalImageData = `data:image/jpeg;base64,${finalImageData}`;
                      }
                      
                      setCurrentImage(finalImageData);
                      console.log('🖼️ Image updated from Blob JSON', {
                        composeId: composeId,
                        imageDataLength: finalImageData.length,
                        timestamp: new Date().toISOString()
                      });
                    } else {
                      console.warn('No image data in parsed JSON from Blob');
                    }
                  } catch (parseError) {
                    // Not JSON, treat as binary image data
                    console.log('Blob is not JSON, treating as binary image data');
                    const binaryReader = new FileReader();
                    binaryReader.onloadend = () => {
                      const base64String = binaryReader.result as string;
                      if (base64String) {
                        setCurrentImage(base64String);
                      }
                    };
                    binaryReader.onerror = (error) => {
                      console.error('Error reading Blob as binary:', error);
                    };
                    binaryReader.readAsDataURL(rawData);
                  }
                }
              };
              textReader.onerror = (error) => {
                console.error('Error reading Blob as text:', error);
                // Fallback to reading as binary
                const binaryReader = new FileReader();
                binaryReader.onloadend = () => {
                  const base64String = binaryReader.result as string;
                  if (base64String) {
                    setCurrentImage(base64String);
                  }
                };
                binaryReader.readAsDataURL(rawData);
              };
              textReader.readAsText(rawData);
              return;
            }
            else {
              console.warn('Unexpected data type:', dataType, rawData);
              return;
            }
          } catch (error) {
            console.error('Error processing websocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error(`❌ WebSocket error (attempt ${attempt}):`, {
            composeId: composeId,
            url: wsUrl,
            error: error,
            readyState: ws.readyState,
            timestamp: new Date().toISOString()
          });
          if (!isResolved) {
            isResolved = true;
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            // Retry if we haven't exceeded max retries
            if (attempt < maxRetries) {
              const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
              console.log(`Retrying WebSocket connection in ${delay}ms...`);
              setTimeout(tryConnect, delay);
            } else {
              setIsConnecting(false);
              reject(new Error(`WebSocket connection failed after ${maxRetries} attempts: ${wsUrl}`));
            }
          }
        };

        ws.onclose = (event) => {
          console.log(`WebSocket closed (attempt ${attempt}):`, {
            composeId: composeId,
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            timestamp: new Date().toISOString()
          });
          
          // Only clear refs if this was the active connection
          if (websocketRef.current === ws) {
            websocketRef.current = null;
            setWebsocket(null);
          }
          
          // Reject if connection closed before opening (connection failed)
          if (!isResolved) {
            isResolved = true;
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            // Retry if we haven't exceeded max retries
            if (attempt < maxRetries) {
              const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
              console.log(`Connection closed before opening, retrying in ${delay}ms...`);
              setTimeout(tryConnect, delay);
            } else {
              setIsConnecting(false);
              reject(new Error(`WebSocket connection closed before opening after ${maxRetries} attempts. Code: ${event.code}, Reason: ${event.reason || 'Unknown'}`));
            }
          }
        };
      };

      // Start first connection attempt
      setTimeout(() => {
        tryConnect();
      }, 5000);
    });
  };

  /**
   * Disconnect the WebSocket connection
   */
  const disconnectWebSocket = () => {
    setIsConnecting(false);
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
      setWebsocket(null);
    }
  };

  /**
   * Clear the current image
   */
  const clearImage = () => {
    setCurrentImage(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, []);

  return {
    websocket,
    currentImage,
    isConnecting,
    connectWebSocket,
    disconnectWebSocket,
    clearImage,
  };
};
