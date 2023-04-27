import type { PropsWithChildren } from 'react';

export default function Layout(props: PropsWithChildren) {
  return (
    <main className='flex h-screen justify-center'>
      <div className='h-full w-full overflow-y-scroll scroll border-x border-slate-400 md:max-w-2xl scrollbar-hide'>{props.children}</div>
    </main>
  );
}
