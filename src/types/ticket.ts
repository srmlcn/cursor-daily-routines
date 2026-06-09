export interface Ticket {
  id: string;
  title: string;
  mr: string | null;
  mrBadge: string | null;
  pipelineBadge: string | null;
  context: string;
  failing: string[];
  thread: string;
}
