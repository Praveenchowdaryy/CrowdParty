import {
  HotTakesPublicState,
  HotTakesPrivateState,
  HotTakePrompt,
} from '@crowdparty/shared';
import { BaseGame } from '../BaseGame';
import { Room } from '../../room/Room';

const HOT_TAKES_PROMPTS: HotTakePrompt[] = [
  {
    id: 'ht-1',
    category: 'Work Culture',
    scenario: 'Which work schedule would you prefer forever?',
    optionA: '4-day workweek with 10-hour days',
    optionB: '5-day workweek with 8-hour days',
  },
  {
    id: 'ht-2',
    category: 'Tech Debates',
    scenario: 'You can only write code with one indentation style:',
    optionA: 'Tabs (flexible indentation)',
    optionB: 'Spaces (universal precision)',
  },
  {
    id: 'ht-3',
    category: 'Daily Dilemma',
    scenario: 'You must permanently give up one for the rest of your life:',
    optionA: 'Coffee / Tea',
    optionB: 'Pizza / Burgers',
  },
  {
    id: 'ht-4',
    category: 'Superpowers',
    scenario: 'Which technological miracle would you activate right now?',
    optionA: 'Devices never need battery charging again',
    optionB: '10 Gbps ultra-fast zero-latency internet everywhere on Earth',
  },
  {
    id: 'ht-5',
    category: 'Remote Work',
    scenario: 'In company-wide virtual meetings, what should the policy be?',
    optionA: 'Cameras strictly mandatory',
    optionB: 'Cameras 100% optional forever',
  },
  {
    id: 'ht-6',
    category: 'Time Machine',
    scenario: 'You are granted a one-way ticket for an exciting 1-year vacation:',
    optionA: 'Travel 200 years into the past',
    optionB: 'Travel 200 years into the future',
  },
  {
    id: 'ht-7',
    category: 'Communication',
    scenario: 'How would you rather handle quick work questions?',
    optionA: 'Async text chat / Slack messages only',
    optionB: 'A quick 2-minute spontaneous huddle / call',
  },
];

export class HotTakesGame extends BaseGame {
  public readonly id = 'hot-takes';
  private prompts: HotTakePrompt[] = [];
  private currentPromptIndex: number = -1;
  private playerVotes: Record<string, { choice: 'A' | 'B'; prediction: 'A' | 'B' }> = {};
  private roundScoresEarned: Record<string, number> = {};

  constructor(room: Room) {
    super(room);
    const shuffled = [...HOT_TAKES_PROMPTS].sort(() => 0.5 - Math.random());
    this.prompts = shuffled.slice(0, 5);
    this.totalRounds = this.prompts.length;
  }

  public start(): void {
    this.nextPrompt();
  }

  private nextPrompt(): void {
    this.currentPromptIndex++;
    if (this.currentPromptIndex >= this.prompts.length) {
      this.finishGame();
      return;
    }

    this.round = this.currentPromptIndex + 1;
    this.playerVotes = {};
    this.roundScoresEarned = {};
    this.phase = 'PLAYING';
    // 20 seconds to vote and predict
    this.deadline = Date.now() + 20000;
    this.roundStartTime = Date.now();

    const p = this.prompts[this.currentPromptIndex];
    this.room.sendSystemMessage(`🔥 Hot Take ${this.round}/${this.totalRounds}: ${p.scenario}`);
    this.room.broadcastState();
  }

  public handleAction(
    playerId: string,
    action: { type: string; payload: any }
  ): { success: boolean; error?: string } {
    if (this.isDisposed) return { success: false, error: 'Game finished' };

    if (action.type === 'submit_vote') {
      if (this.phase !== 'PLAYING') {
        return { success: false, error: 'Voting is not active' };
      }

      if (this.playerVotes[playerId]) {
        return { success: false, error: 'Vote already recorded' };
      }

      const { choice, prediction } = action.payload || {};
      if ((choice !== 'A' && choice !== 'B') || (prediction !== 'A' && prediction !== 'B')) {
        return { success: false, error: 'Invalid vote or prediction' };
      }

      this.playerVotes[playerId] = { choice, prediction };

      const activePlayerCount = Array.from(this.room.players.values()).filter(p => p.isOnline).length;
      if (Object.keys(this.playerVotes).length >= activePlayerCount && activePlayerCount > 0) {
        this.revealVotes();
      } else {
        this.room.broadcastState();
      }

      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private revealVotes(): void {
    this.phase = 'ROUND_END';
    // 7 seconds discussion and stats reveal
    this.deadline = Date.now() + 7000;

    let votesA = 0;
    let votesB = 0;

    for (const vote of Object.values(this.playerVotes)) {
      if (vote.choice === 'A') votesA++;
      else votesB++;
    }

    let majority: 'A' | 'B' | 'TIE' = 'TIE';
    if (votesA > votesB) majority = 'A';
    else if (votesB > votesA) majority = 'B';

    for (const [playerId, vote] of Object.entries(this.playerVotes)) {
      let earned = 150; // Participation points
      if (majority !== 'TIE' && vote.prediction === majority) {
        earned += 250; // Crowd predictor bonus!
      } else if (majority === 'TIE') {
        earned += 100; // Tie bonus
      }

      this.scores[playerId] = (this.scores[playerId] || 0) + earned;
      this.roundScoresEarned[playerId] = earned;
    }

    this.room.broadcastState();
  }

  public tick(now: number): void {
    if (this.isDisposed) return;

    if (this.deadline && now >= this.deadline) {
      if (this.phase === 'PLAYING') {
        this.revealVotes();
      } else if (this.phase === 'ROUND_END') {
        this.nextPrompt();
      }
    }
  }

  public getPublicState(): HotTakesPublicState {
    const now = Date.now();
    const timeRemainingMs = this.deadline ? Math.max(0, this.deadline - now) : 0;
    const currentP = this.prompts[this.currentPromptIndex] || null;

    let votesAList: string[] = [];
    let votesBList: string[] = [];

    if (this.phase === 'ROUND_END' || this.phase === 'RESULTS') {
      for (const [pId, vote] of Object.entries(this.playerVotes)) {
        if (vote.choice === 'A') votesAList.push(pId);
        else votesBList.push(pId);
      }
    }

    const totalVotes = votesAList.length + votesBList.length;
    const percentA = totalVotes > 0 ? Math.round((votesAList.length / totalVotes) * 100) : 50;
    const percentB = totalVotes > 0 ? 100 - percentA : 50;

    let majority: 'A' | 'B' | 'TIE' = 'TIE';
    if (votesAList.length > votesBList.length) majority = 'A';
    else if (votesBList.length > votesAList.length) majority = 'B';

    return {
      gameId: 'hot-takes',
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      deadline: this.deadline,
      timeRemainingMs,
      scores: { ...this.scores },
      leaderboard: this.getLeaderboard(),
      promptIndex: this.currentPromptIndex,
      totalPrompts: this.totalRounds,
      currentPrompt: currentP,
      votedPlayerIds: Object.keys(this.playerVotes),
      roundReveal: (this.phase === 'ROUND_END' || this.phase === 'RESULTS') ? {
        votesA: votesAList,
        votesB: votesBList,
        percentA,
        percentB,
        majority,
        scoresEarned: this.roundScoresEarned,
      } : undefined,
    };
  }

  public getPrivateState(playerId: string): HotTakesPrivateState {
    const vote = this.playerVotes[playerId];
    return {
      hasVoted: !!vote,
      myVote: vote?.choice,
      myPrediction: vote?.prediction,
    };
  }
}
