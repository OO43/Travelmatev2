import type { JourneyStatus } from './journey';

export type FeedbackRating = 'helpful' | 'somewhat_helpful' | 'not_helpful';

export type PassengerFeedback = {
  journeyId: string;
  journeyStatus: JourneyStatus;
  rating: FeedbackRating;
  comment?: string;
  submittedAt: string;
};
