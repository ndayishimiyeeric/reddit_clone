import React from "react";
import {getAuthSession} from "@/lib/auth";
import {db} from "@/lib/db";
import {notFound} from "next/navigation";
import {format} from "date-fns"
import SubscriberLeaveToggle from "@/components/SubscriberLeaveToggle";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/Button";

const Layout = async ({ children, params: {slug} }: {
    children: React.ReactNode
    params: { slug: string }
}) => {
  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
      where: {name: slug},
      include: {
          posts: {
              include: {
                  author: true,
                  votes: true,
              },
          }
      }
  })

  const subscription = !session?.user
      ? undefined
      : await db.subscription.findFirst({
          where: {
              subreddit: {
                    name: slug,
              },
              user: {
                  id: session.user.id,
              },
          }
      });
  const isSubscribed = !!subscription;

  const memberCount = await db.subscription.count({
      where: {
          subreddit: {
              name: slug,
          },
      },
  });

  if(!subreddit) return notFound();

  return (
    <>
        <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
            <div>
                {/* TODO: Back Button   */}

                <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
                    <div className='flex flex-col col-span-2 space-y-6'>{children}</div>

                    {/*  Info sidebar  */}
                    <div className='hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
                        <div className='px-6 py-4'>
                            <p className='font-semibold py-3'>About r/{slug}</p>
                        </div>

                        <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-gray-500">Created</dt>
                                <dd className="text-gray-700"><time dateTime={subreddit.createdAt.toDateString()}>
                                    {format(subreddit.createdAt, 'MMMM dd, yyyy')}
                                </time></dd>
                            </div>

                            <div className='flex justify-between gap-x-4 py-3'>
                                <dt className="text-gray-500">Members</dt>
                                <dd className="text-gray-700">{memberCount}</dd>
                            </div>

                            {subreddit.creatorId === session?.user.id ? (
                                <div className='flex justify-between gap-x-4 py-3'>
                                    <p className='text-gray-500'>You&apos;re the creator</p>
                                </div>
                            ) : null}

                            {subreddit.creatorId !== session?.user.id ? (
                                <SubscriberLeaveToggle
                                    subredditID={subreddit.id}
                                    subredditName={subreddit.name}
                                    isSubscribed={isSubscribed}
                                />
                            ) : null}

                            <Link
                                href={`r/${slug}/submit`}
                                className={buttonVariants({
                                    variant: 'outline',
                                    className: 'w-full mb-6'
                                })}
                            >Create Post</Link>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
};

export default Layout;
