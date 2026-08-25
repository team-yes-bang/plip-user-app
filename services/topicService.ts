import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { ApiCreateTopicRequest, ApiTopic, ApiTopicListStatus, ApiTopicVideo, ApiUpdateTopicRequest } from "@/types/topic/api";
import type { UiTopicDetail, UiTopicFeedWindow, UiTopicGallery, UiTopicListItem, UiTopicVideo } from "@/types/topic/ui";
import * as topicApi from "@/lib/api/topicApi";
import { toFeedOrder } from "@/lib/topic/mergeTopicFeed";
import { resolveVideoThumbnail } from "@/lib/video/thumbnail";
import { formatKstDotDate, isSameKstDate, selectAgitTopic, toKstDateString } from "@/lib/topic/selectAgitTopic";
import * as videoService from "@/services/videoService";

const FALLBACK_AVATAR = "/plip/v13/profile-avatar.svg";
const FALLBACK_NICKNAME = "멤버";

type MemberProfile = {
  nickname: string;
  profileImageSrc: string;
};

function memberMap(members: ApiAgitDetailMember[]): Map<string, MemberProfile> {
  const map = new Map<string, MemberProfile>();
  for (const member of members) {
    map.set(member.userUuid, {
      nickname: member.nickname.trim() || FALLBACK_NICKNAME,
      profileImageSrc: member.profileImagePath?.trim() || FALLBACK_AVATAR,
    });
  }
  return map;
}

function profileOf(userUuid: string, members: Map<string, MemberProfile>): MemberProfile {
  return (
    members.get(userUuid) ?? {
      nickname: FALLBACK_NICKNAME,
      profileImageSrc: FALLBACK_AVATAR,
    }
  );
}

async function mapTopicVideo(
  item: ApiTopicVideo,
  members: Map<string, MemberProfile>,
): Promise<UiTopicVideo> {
  const attached = profileOf(item.userUuid, members);
  try {
    const detail = await videoService.getVideoDetail(item.videoUuid);
    const profile = profileOf(detail.userUuid || item.userUuid, members);
    return {
      id: item.videoUuid,
      thumbnailSrc: resolveVideoThumbnail(detail.thumbnailUrl),
      profileImageSrc: profile.profileImageSrc,
      profileNickname: profile.nickname,
      uploadedAt: detail.createdAt.toISOString(),
      caption: detail.caption?.trim() ?? "",
      rawPlaybackUrl: detail.rawPlaybackUrl,
    };
  } catch {
    return {
      id: item.videoUuid,
      thumbnailSrc: resolveVideoThumbnail(null),
      profileImageSrc: attached.profileImageSrc,
      profileNickname: attached.nickname,
      uploadedAt: item.createdAt,
      caption: "",
    };
  }
}

export function toUiTopicListItem(topic: ApiTopic): UiTopicListItem {
  return {
    id: topic.topicUuid,
    title: topic.title?.trim() ?? "",
    startAtLabel: formatKstDotDate(topic.startAt),
    videoCount: topic.videoCount,
    creatorUuid: topic.creatorUuid,
  };
}

export async function listTopics(agitUuid: string): Promise<UiTopicListItem[]> {
  const topics = await topicApi.listTopics(agitUuid);
  return topics.map(toUiTopicListItem);
}

export async function listTopicsByStatus(
  agitUuid: string,
  status: ApiTopicListStatus,
  limit?: number,
): Promise<UiTopicListItem[]> {
  const topics = await topicApi.listTopicsByStatus(agitUuid, status, limit);
  return topics.map(toUiTopicListItem);
}

export async function createTopic(input: ApiCreateTopicRequest): Promise<ApiTopic> {
  return topicApi.createTopic(input);
}

export function toUiTopicDetail(topic: ApiTopic): UiTopicDetail {
  const parsed = new Date(topic.startAt);
  return {
    id: topic.topicUuid,
    title: topic.title?.trim() ?? "",
    startDate: Number.isNaN(parsed.getTime()) ? topic.startAt.slice(0, 10) : toKstDateString(parsed),
    videoCount: topic.videoCount,
    creatorUuid: topic.creatorUuid,
    uploadedByMe: topic.uploadedByMe ?? null,
  };
}

export async function getTopic(topicUuid: string): Promise<UiTopicDetail> {
  const topic = await topicApi.getTopic(topicUuid);
  return toUiTopicDetail(topic);
}

export async function updateTopic(topicUuid: string, input: ApiUpdateTopicRequest): Promise<ApiTopic> {
  return topicApi.updateTopic(topicUuid, input);
}

export async function deleteTopic(topicUuid: string): Promise<void> {
  await topicApi.deleteTopic(topicUuid);
}

function mapSummary(topic: ApiTopic): UiTopicGallery["topic"] {
  return {
    id: topic.topicUuid,
    title: topic.title?.trim() ?? "",
    startAt: topic.startAt,
    isToday: isSameKstDate(topic.startAt),
  };
}

export async function getTopicViewer(
  topicUuid: string,
  members: ApiAgitDetailMember[],
): Promise<{ topic: UiTopicDetail; videos: UiTopicVideo[] }> {
  const [topic, topicVideos] = await Promise.all([
    topicApi.getTopic(topicUuid),
    topicApi.listTopicVideos(topicUuid),
  ]);
  const profiles = memberMap(members);
  const videos = await Promise.all(topicVideos.map((item) => mapTopicVideo(item, profiles)));
  return { topic: toUiTopicDetail(topic), videos };
}

export async function getTopicGallery(
  agitUuid: string,
  members: ApiAgitDetailMember[],
): Promise<UiTopicGallery> {
  const topics = await topicApi.listTopics(agitUuid);
  const selected = selectAgitTopic(topics);
  if (!selected) {
    return { topic: null, videos: [] };
  }

  const topicVideos = await topicApi.listTopicVideos(selected.topicUuid);
  const profiles = memberMap(members);
  const videos = await Promise.all(topicVideos.map((item) => mapTopicVideo(item, profiles)));
  return { topic: mapSummary(selected), videos };
}

const FEED_NEIGHBOR_LIMIT = 3;

export async function getTopicFeedWindow(params: {
  agitUuid: string;
  topicUuid?: string;
  date?: string;
  before?: number;
  after?: number;
}): Promise<UiTopicFeedWindow> {
  const before = params.before ?? FEED_NEIGHBOR_LIMIT;
  const after = params.after ?? FEED_NEIGHBOR_LIMIT;
  let feed = await topicApi.getTopicFeed({
    agitUuid: params.agitUuid,
    topicUuid: params.topicUuid,
    date: params.date,
    before,
    after,
  });

  if (!feed.current) {
    try {
      const allTopics = await topicApi.listTopics(params.agitUuid);
      const selected = selectAgitTopic(allTopics);
      if (selected) {
        feed = await topicApi.getTopicFeed({
          agitUuid: params.agitUuid,
          topicUuid: selected.topicUuid,
          before,
          after,
        });
      }
    } catch {
      // ignore fallback error
    }
  }

  if (!feed.current) {
    return { topics: [], currentId: null, hasMoreBefore: false, hasMoreAfter: false };
  }
  const ordered = toFeedOrder(feed.before ?? [], feed.current, feed.after ?? []);
  return {
    topics: ordered.map(toUiTopicDetail),
    currentId: feed.current.topicUuid,
    hasMoreBefore: (feed.before?.length ?? 0) >= before,
    hasMoreAfter: (feed.after?.length ?? 0) >= after,
  };
}

export async function getTopicVideos(
  topicUuid: string,
  members: ApiAgitDetailMember[],
): Promise<UiTopicVideo[]> {
  const viewer = await getTopicViewer(topicUuid, members);
  return viewer.videos;
}
