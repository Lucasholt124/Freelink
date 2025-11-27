// app/types/brain.ts

import { Id } from "@/convex/_generated/dataModel";

// =================================================================
// TIPOS DO SCRIPT TIMELINE
// =================================================================
export interface ScriptTimelineItem {
  // Campos do formato ULTRA (novo)
  timestamp?: string;
  duration_seconds?: number;
  action_description?: string;
  spoken_text?: string;
  camera_movement?: string;
  camera_angle?: string;
  screen_text_overlay?: string;
  sound_effect?: string;
  music_cue?: string;
  visual_effect?: string;
  emotion_tone?: string;
  retention_technique?: string;

  // Campos do formato PRO (legado)
  start_time?: string;
  end_time?: string;
  action?: string;
  screen_text?: string;
  audio_note?: string;
}

// =================================================================
// TIPOS DE CONTEÚDO - REEL
// =================================================================
export interface ReelContent {
  title: string;

  // Campos ULTRA
  concept?: string;
  hook_type?: string;
  hook_text?: string;
  hook_visual?: string;
  total_duration?: string;
  format?: string;
  main_narrative?: string;
  key_messages?: string[];
  cta_text?: string;
  cta_timing?: string;
  script_timeline?: ScriptTimelineItem[];
  camera_equipment?: string[];
  lighting_setup?: string;
  location_suggestions?: string[];
  wardrobe_props?: string[];
  audio_track_style?: string;
  audio_bpm_suggestion?: string;
  sound_effects_list?: string[];
  transitions_used?: string[];
  text_animations?: string[];
  color_grading?: string;
  aspect_ratio?: string;
  posting_caption?: string;
  hashtags?: string[];
  best_posting_time?: string;
  expected_retention_curve?: string;
  viral_score_prediction?: number;
  improvement_notes?: string;

  // Campos PRO (legado)
  hook?: string;
  main_points?: string[];
  cta?: string;
  visual_suggestion?: string;
  audio_suggestion?: string;
  camera_angles_summary?: string[];
  transitions?: string[];
  editing_notes?: string;
}

// =================================================================
// TIPOS DE CONTEÚDO - CARROSSEL
// =================================================================
export interface CarouselSlide {
  slide_number: number;

  // Campos ULTRA
  headline?: string;
  body_text?: string;
  visual_description?: string;
  design_elements?: string[];
  color_scheme?: string;
  font_suggestion?: string;
  cta_on_slide?: string;
  transition_to_next?: string;

  // Campos PRO (legado)
  title?: string;
  content?: string;
}

export interface CarouselContent {
  title: string;
  slides: CarouselSlide[];

  // Campos ULTRA
  concept?: string;
  total_slides?: number;
  hook_slide?: string;
  final_cta_slide?: string;
  design_style?: string;
  brand_colors_suggestion?: string[];
  typography_guide?: string;
  image_style?: string;
  posting_caption?: string;
  hashtags?: string[];
  engagement_prediction?: string;
  swipe_triggers?: string[];

  // Campos PRO (legado)
  cta_slide?: string;
  design_tips?: string[];
}

// =================================================================
// TIPOS DE CONTEÚDO - POST DE IMAGEM
// =================================================================
export interface ImagePostContent {
  hashtags: string[];

  // Campos ULTRA
  concept?: string;
  visual_description?: string;
  image_generation_prompt?: string;
  style_reference?: string;
  composition?: string;
  color_palette?: string[];
  text_overlay?: string;
  caption_hook?: string;
  caption_body?: string;
  caption_cta?: string;
  full_caption?: string;
  alt_text?: string;
  best_posting_time?: string;
  engagement_triggers?: string[];

  // Campos PRO (legado)
  idea?: string;
  caption?: string;
  image_prompt?: string;
  best_time?: string;
}

// =================================================================
// TIPOS DE CONTEÚDO - STORIES
// =================================================================
export interface StorySlide {
  slide_number: number;
  type: "Text" | "Poll" | "Quiz" | "Question" | "Q&A" | "Countdown" | "Link" | "Mention" | "Music" | "GIF";

  // Campos ULTRA
  duration_seconds?: number;
  background_type?: string;
  background_description?: string;
  main_text?: string;
  text_animation?: string;
  sticker_type?: string;
  poll_question?: string;
  poll_options?: string[];
  quiz_question?: string;
  quiz_options?: string[];
  quiz_correct_answer?: number;
  question_prompt?: string;
  link_url?: string;
  link_label?: string;
  music_suggestion?: string;
  engagement_goal?: string;

  // Campos PRO (legado)
  content?: string;
  options?: string[];
}

export interface StorySequenceContent {
  theme: string;
  slides: StorySlide[];

  // Campos ULTRA
  narrative_arc?: string;
  total_stories?: number;
  posting_schedule?: string;
  engagement_hooks?: string[];
  response_strategy?: string;
  highlight_worthy?: boolean;
  highlight_cover_idea?: string;

  // Campos PRO (legado)
  engagement_tips?: string[];
}

// =================================================================
// TIPOS DE ESTRATÉGIA VIRAL - UNIFICADO
// =================================================================
export interface ViralStrategy {
  // Campos obrigatórios (presentes em ambos formatos)
  best_times: string[];
  hashtag_strategy: string;
  engagement_hacks: string[];

  // Campos ULTRA (opcionais)
  content_pillars?: string[];
  posting_frequency?: string;
  best_times_detailed?: {
    day: string;
    times: string[];
    reasoning: string;
  }[];
  hashtag_sets?: {
    category: string;
    hashtags: string[];
    reach_estimate: string;
  }[];
  engagement_tactics?: {
    tactic: string;
    implementation: string;
    expected_result: string;
  }[];
  growth_hacks?: string[];
  collaboration_ideas?: string[];
  trend_adaptation_tips?: string[];
  algorithm_optimization?: string[];
  community_building?: string[];
  monetization_path?: string[];
}

// =================================================================
// TIPOS DE ANÁLISE (ULTRA)
// =================================================================
export interface ContentAnalysis {
  user_intent: string;
  identified_niche: string;
  target_audience_profile: {
    demographics: string;
    psychographics: string;
    pain_points: string[];
    desires: string[];
    content_preferences: string[];
  };
  content_opportunities: string[];
  competitive_advantage: string;
  unique_angle: string;
}

// =================================================================
// CONTENT PACK
// =================================================================
export interface ContentPack {
  reels: ReelContent[];
  carousels: CarouselContent[];
  image_posts: ImagePostContent[];
  story_sequences: StorySequenceContent[];
}

// =================================================================
// RESULTADO PRINCIPAL DO BRAIN
// =================================================================
export interface BrainResults {
  // Campo obrigatório
  theme_summary: string;
  content_pack: ContentPack;
  viral_strategy: ViralStrategy;

  // Campos ULTRA (opcionais)
  analysis?: ContentAnalysis;
  optimized_strategy?: string;
  weekly_content_calendar?: {
    day: string;
    content_type: string;
    content_title: string;
    posting_time: string;
    goal: string;
  }[];
  success_metrics?: {
    metric: string;
    target: string;
    tracking_method: string;
  }[];
  final_recommendations?: string[];

  // Campo PRO legado (opcional)
  target_audience_suggestion?: string;
}

// =================================================================
// TIPOS DE CONTEÚDO
// =================================================================
export type ContentType = "reel" | "carousel" | "image_post" | "story_sequence";

// =================================================================
// MODAL DE AGENDAMENTO
// =================================================================
export interface ScheduleModalData {
  isOpen: boolean;
  campaignId?: Id<"brainCampaigns">;
  contentType?: ContentType;
  contentData?: ReelContent | CarouselContent | ImagePostContent | StorySequenceContent;
  initialCaption?: string;
  initialHashtags?: string[];
}

// =================================================================
// CAMPANHA DO BRAIN (para o banco de dados)
// =================================================================
export interface BrainCampaign {
  _id: Id<"brainCampaigns">;
  _creationTime: number;
  theme: string;
  themeSummary: string;
  targetAudience: string;
  viralStrategy: ViralStrategy;
  contentPack: string; // JSON stringified
  createdAt: number;
}

// =================================================================
// HELPER TYPE GUARDS
// =================================================================
export function isReelContent(content: unknown): content is ReelContent {
  return typeof content === 'object' && content !== null && 'title' in content;
}

export function isCarouselContent(content: unknown): content is CarouselContent {
  return typeof content === 'object' && content !== null && 'slides' in content && Array.isArray((content as CarouselContent).slides);
}

export function isImagePostContent(content: unknown): content is ImagePostContent {
  return typeof content === 'object' && content !== null && 'hashtags' in content;
}

export function isStorySequenceContent(content: unknown): content is StorySequenceContent {
  return typeof content === 'object' && content !== null && 'theme' in content && 'slides' in content;
}