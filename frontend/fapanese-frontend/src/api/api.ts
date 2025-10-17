// src/api/api.ts

interface VoiceResponse {
  text: string;           
  audioBase64: string;    
}

export async function sendAudioToNodeBackend(audioBlob: Blob): Promise<VoiceResponse> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "user_recording.webm"); // webm là định dạng phổ biến từ trình duyệt

  console.log("Đang gửi audio đến /ai-api/audio..."); 
  
  // 🚨 Sử dụng '/ai-api/audio' để đi qua proxy Node.js
  const response = await fetch("/ai-api/audio", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.text || `Lỗi HTTP: ${response.status}`;
    throw new Error(errorMessage);
  }

  const data: VoiceResponse = await response.json();
  return data;
}