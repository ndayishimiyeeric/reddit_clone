"use client"

import React from "react";
import type  {VoteType, CommentVote} from "@prisma/client";
import {useCustomToast} from "@/hooks/use-custom_toast";
import {usePrevious} from "@mantine/hooks";
import {Button} from "@/components/ui/Button";
import {ArrowBigDown, ArrowBigUp} from "lucide-react";
import {cn} from "@/lib/utils";
import {useMutation} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import {toast} from "@/hooks/use-toast";
import {CommentVoteType} from "@/lib/validators/vote";

type partialCommentVote = Pick<CommentVote, 'type'>
interface CommentVotesProps {
    commentId: string;
    initialVotesCount: number;
    initialVoteType?: partialCommentVote;
}

const CommentVotes: React.FC<CommentVotesProps> = (
    {
        commentId,
        initialVotesCount,
        initialVoteType,
    }
) => {
  const {loginToast} = useCustomToast();
  const [votesCount, setVotesCount] = React.useState<number>(initialVotesCount);
  const [currentVoteType, setCurrentVoteType] = React.useState(initialVoteType);
  const prevVoteType = usePrevious(currentVoteType)

  React.useEffect(() => {
      setCurrentVoteType(initialVoteType)
  }, [initialVoteType])

  const {mutate: voteOnPost} = useMutation({
      mutationFn: async (voteType: VoteType) => {
          const payload: CommentVoteType = {
              commentId: commentId,
              voteType: voteType,
          }

          await axios.patch('/api/subreddit/post/comment/vote', payload)
      },
      onError: (e, voteType) => {
          if(voteType === 'UP') setVotesCount((prev) => prev - 1);
          else setVotesCount((prev) => prev + 1);

          // reset current vote type
          setCurrentVoteType(prevVoteType);

          if(e instanceof AxiosError) {
              if(e.response?.status === 401) return loginToast();
          }

          return toast({
              title: 'Error',
              description: 'Something went wrong. Please try again.',
              variant: 'destructive',
          })
      },
      onMutate: (type) => {
          if(currentVoteType?.type === type) {
              setCurrentVoteType(undefined);
              if(type === 'UP') setVotesCount((prev) => prev - 1);
              else if (type === 'DOWN') setVotesCount((prev) => prev + 1) ;
          } else {
              setCurrentVoteType({type});
              if(type === 'UP') setVotesCount((prev) => prev + (currentVoteType ? 2 : 1));
                else if (type === 'DOWN') setVotesCount((prev) => prev - (currentVoteType ? 2 : 1));
          }
      },
  })
  return (
      <div className='flex gap-1'>
          <Button size='sm' variant='ghost' aria-label='upvote' onClick={() => voteOnPost('UP')}>
              <ArrowBigUp className={cn('h-5 w-5 text-zinc-700', {
                  'text-emerald-500 fill-emerald-500': currentVoteType?.type === 'UP'
              })}/>
          </Button>

          <p className='text-center py-2 font-medium text-sm text-zinc-900'>{votesCount}</p>

          <Button size='sm' variant='ghost' aria-label='downvote' onClick={() => voteOnPost('DOWN')}>
              <ArrowBigDown className={cn('h-5 w-5 text-zinc-700', {
                  'text-red-500 fill-red-500': currentVoteType?.type === 'DOWN'
              })}/>
          </Button>
      </div>
  );
}

export default CommentVotes;
