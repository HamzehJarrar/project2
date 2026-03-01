import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { eq , and } from "drizzle-orm";

export async function createFeed(
  feedName: string,
  url: string,
  userId: string,
) {
  try {
    const [result] = await db
      .insert(feeds)
      .values({ name: feedName, url, userId })
      .returning();
    return result;
  } catch (error) {
    console.error("Database Error Details:", error);
    throw error;
  }
}
export async function getAllFeeds() {
  return await db
    .select({
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}
export async function createFeedFollow(userId: string, feedId: string) {
  const [inserted] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, inserted.id));

  return result;
}
export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId));
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}
export async function deleteFeedFollow(userId: string, url: string) {
  const feed = await getFeedByUrl(url);
  if (!feed) throw new Error("Feed not found");
  await db.delete(feedFollows);
  await db
    .delete(feedFollows)
    .where(
      and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)),
    );
}
