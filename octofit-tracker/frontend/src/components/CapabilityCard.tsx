import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type State<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

type Props<T> = {
  title: string;
  description: string;
  path: string;
  emptyText: string;
  isEmpty: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, path, emptyText, isEmpty, children }: Props<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<T>(path).then(
      (data) => {
        if (active) setState({ status: 'success', data });
      },
      (error: unknown) => {
        if (!active) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to load data.',
        });
      },
    );
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'success' && (
          isEmpty(state.data) ? <p>{emptyText}</p> : children(state.data)
        )}
      </div>
    </section>
  );
}
