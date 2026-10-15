import { MARKS } from "@/components/marks";
import { Scribble } from "@/components/Scribble";

type MarkProps = Omit<Parameters<typeof Scribble>[0], "src" | "routes" | "brush"> & {
  kind: keyof typeof MARKS;
};

/** One of the deck's hand-drawn marks, drawn in as the slide reaches reveal state `at`. */
export function Mark({ kind, w, ...rest }: MarkProps) {
  const mark = MARKS[kind];
  return <Scribble src={mark.src} routes={mark.routes} brush={mark.brush * w} w={w} {...rest} />;
}
