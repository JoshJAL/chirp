import { SignInButton, useUser } from '@clerk/nextjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { type NextPage } from 'next';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

dayjs.extend(relativeTime);

import { LoadingPage, LoadingSpinner } from '@/components/loadingSpinner/LoadingSpinner';
import { RouterOutputs, api } from '@/utils/api';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '@/components/loadingSpinner/layout/Layout';

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState('');

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      {
        setInput('');
        void ctx.posts.getAll.invalidate();
      }
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error('Failed to post! Please try again later!');
      }
    }
  });

  if (!user) return null;

  return (
    <div className='flex w-full gap-3'>
      <Image width={56} height={56} src={user.profileImageUrl} alt='Profile image' className='h-14 w-14 rounded-full' />
      <input
        placeholder='Type some emojis!'
        className='grow bg-transparent outline-none'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (input !== '') {
              mutate({ content: input });
            }
          }
        }}
      />
      {input !== '' && !isPosting && <button onClick={() => mutate({ content: input })}>Post</button>}

      {isPosting && (
        <div className='flex items-center justify-center'>
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs['posts']['getAll'][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className='flex gap-3 border-b border-slate-400 p-4'>
      <Image
        width={56}
        height={56}
        src={author.profileImageUrl}
        className='h-14 w-14 rounded-full'
        alt={`@${author.username}'s profile picture`}
      />
      <div className='flex flex-col'>
        <div className='flex gap-1 text-slate-300'>
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span className='font-thin'> · </span>
          <Link href={`/post/${post.id}`}>
            <span className='font-thin'>{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className='text-2xl'>{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className='flex flex-col'>
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching ASAP
  api.posts.getAll.useQuery();

  // Return empty div id BOTH aren't loaded, since user tends to load faster
  if (!userLoaded) return <></>;

  return (
    <Layout>
      <div className='flex border-b border-slate-400 p-4 '>
        {!isSignedIn && (
          <div className='flex justify-center'>
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </Layout>
  );
};

export default Home;
