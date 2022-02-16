interface Props {
  url: string;
}

export function Sharing({ url }: Props) {
  return <div>{url}</div>;
}
