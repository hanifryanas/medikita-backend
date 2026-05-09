export interface DepartmentContentFaq {
  question: string;
  answer: string;
}

export interface DepartmentContent {
  tagline?: string;
  overview?: string;
  highlights?: string[];
  faq?: DepartmentContentFaq[];
}
