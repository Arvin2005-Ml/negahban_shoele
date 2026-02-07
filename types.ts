
export interface GameState {
  intensity: number; // 0 to 100
  color: string;
  isGameOver: boolean;
  history: ChatMessage[];
  startTime: number;
  lastAiInteraction: number;
  gamePhase: 'intro' | 'playing' | 'ending';
  turnCount: number;
  isVictory: boolean;
  analysis?: string; // Psychological analysis of the session
  letter?: string;   // Final letter to the user
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AiResponse {
  text: string;
  mood_color: string;
  flame_size: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export enum GameAction {
  SHELTER = 'پناه گرفتن در کنج دیوار',
  ADD_WOOD = 'اضافه کردن چوب خشک',
  SURRENDER = 'سپردن به باد (ناامیدی)',
}
