import Layout from '@/components/layout/Layout';
import { PostView } from '@/components/postView/PostView';
import { generateSSGHelper } from '@/server/helpers/ssgHelper';
import { api } from '@/utils/api';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({ id });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <Layout>
        <PostView {...data} />
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== 'string') throw new Error('no id');

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' };
};
export default SinglePostPage;
