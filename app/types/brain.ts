// types/brain.ts - TIPOS COMPARTILHADOS PARA FREELINKBRAIN
import { Id } from "@/convex/_generated/dataModel";

// ============================================
// CONTEÚDO GERADO
// ============================================

export interface ScriptTimelineItem {
  start_time: string;
  end_time: string;
  action: string;
  camera_angle: string;
  screen_text?: string;
  audio_note?: string;
}

export interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  visual_suggestion: string;
  audio_suggestion: string;
  script_timeline?: ScriptTimelineItem[];
  camera_angles_summary?: string[];
  transitions?: string[];
  editing_notes?: string;
  viralScore?: number;
  estimatedReach?: string;
}

export interface CarouselSlide {
  slide_number: number;
  title: string;
  content: string;
}

export interface CarouselContent {
  title: string;
  slides: CarouselSlide[];
  cta_slide: string;
  design_tips: string[];
}

export interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
  hashtags: string[];
  best_time: string;
}

export interface StorySlide {
  slide_number: number;
  type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
  content: string;
  options?: string[];
}

export interface StorySequenceContent {
  theme: string;
  slides: StorySlide[];
  engagement_tips: string[];
}

// Union type para todos os tipos de conteúdo
export type ContentData =
  | ReelContent
  | CarouselContent
  | ImagePostContent
  | StorySequenceContent;

// ============================================
// TIPOS DE CONTEÚDO
// ============================================

export type ContentType =
  | "reel"
  | "carousel"
  | "image_post"
  | "story_sequence";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "publishing"
  | "published"
  | "failed";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "twitter";

// ============================================
// BRAIN RESULTS
// ============================================

export interface ContentPack {
  reels: ReelContent[];
  carousels: CarouselContent[];
  image_posts: ImagePostContent[];
  story_sequences: StorySequenceContent[];
}

export interface ViralStrategy {
  best_times: string[];
  hashtag_strategy: string;
  engagement_hacks: string[];
}

export interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string;
  content_pack: ContentPack;
  viral_strategy: ViralStrategy;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function extractCaptionAndHashtags(
  contentType: ContentType,
  content: ContentData
): { caption: string; hashtags: string[] } {
  let caption = "";
  let hashtags: string[] = [];

  switch (contentType) {
    case "reel": {
      const reel = content as ReelContent;
      caption = `${reel.title}\n\n${reel.hook}\n\n${reel.main_points.join('\n')}\n\n${reel.cta}`;
      break;
    }
    case "carousel": {
      const carousel = content as CarouselContent;
      caption = `${carousel.title}\n\n${carousel.slides.map(s => s.content).join('\n\n')}\n\n${carousel.cta_slide}`;
      break;
    }
    case "image_post": {
      const post = content as ImagePostContent;
      caption = post.caption;
      hashtags = post.hashtags;
      break;
    }
    case "story_sequence": {
      const story = content as StorySequenceContent;
      caption = `${story.theme}\n\n${story.slides.map(s => s.content).join('\n')}`;
      break;
    }
  }

  return { caption, hashtags };
}

export function isReelContent(content: ContentData): content is ReelContent {
  return 'hook' in content && 'main_points' in content;
}

export function isCarouselContent(content: ContentData): content is CarouselContent {
  return 'slides' in content && 'cta_slide' in content;
}

export function isImagePostContent(content: ContentData): content is ImagePostContent {
  return 'image_prompt' in content && 'caption' in content;
}

export function isStorySequenceContent(content: ContentData): content is StorySequenceContent {
  return 'slides' in content && 'engagement_tips' in content;
}

// ============================================
// SCHEDULE MODAL TYPES
// ============================================

export interface ScheduleModalData {
  isOpen: boolean;
  campaignId?: Id<"brainCampaigns">;
  contentType?: ContentType;
  contentData?: ContentData;
  initialCaption?: string;
  initialHashtags?: string[];
}