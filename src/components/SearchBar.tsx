"use client"

import React from "react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/Command";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Subreddit, Prisma} from "@prisma/client";
import {useRouter} from "next/navigation";
import {Loader2Icon, Users} from "lucide-react";
import debounce from 'lodash.debounce'

const SearchBarProps = () => {};

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const router = useRouter()

  const {
      data: searchResults,
      isFetching,
      refetch,
      isFetched,
  } = useQuery({
      queryKey: ['search-communities-query'],
      enabled: false,
      queryFn: async () => {
          if (!searchQuery) return []
          const {data} = await axios.get(`/api/search?q=${searchQuery}`)
          return data as (Subreddit & {_count: Prisma.SubredditCountOutputType})[]
      },
  })
  const request = debounce(async () => {
      await refetch()
  }, 400)

  const debounceRequest = React.useCallback(() => {
      request()
  }, [request])

  return (
      <Command className='relative rounded-lg border max-w-lg z-50 overflow-visible'>
          <CommandInput
              className='outline-none border-none focus:border-none focus:outline-none ring-0'
              placeholder='Search communities...'
              value={searchQuery}
              onValueChange={(text) => {
                  setSearchQuery(text)
                  debounceRequest()
              }}
          ></CommandInput>

          {searchQuery.length > 0 && (
              <CommandList
                  className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'
              >
                  {isFetched ? (
                      <CommandEmpty>
                          <div className='flex items-center justify-center'>
                            {isFetching ? (
                            <Loader2Icon className='animate-spin w-4 h-4'/>
                            ) : 'No matching results found'}
                          </div>
                      </CommandEmpty>

                  ) : null}
                  {(searchResults?.length ?? 0) > 0 && (
                      <CommandGroup
                          heading='Communities'
                      >
                          {searchResults?.map((subreddit) => {
                              return (
                                  <CommandItem
                                      key={subreddit.id}
                                      onSelect={(e) => {
                                          router.push(`/r/${e || subreddit.name}`)
                                          router.refresh()
                                      }}
                                      value={subreddit.name}
                                  >
                                      <Users className='mr-2 h-4 w-4'/>
                                      <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                                  </CommandItem>
                              )
                          })}
                      </CommandGroup>
                  )}
              </CommandList>
          )}
      </Command>
  )
}

export default SearchBar
