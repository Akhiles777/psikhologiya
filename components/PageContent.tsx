/**
 * Отображение контента страницы из БД (шаблон «текст» или «пустой»).
 * Используется в /s/[slug], /courses, /lib, /connect, /contacts.
 */
type Props = {
  title: string;
  template: string;
  content: string;
};

export function PageContent({ title, template, content }: Props) {
  if (template === "empty") {
    return (
      <div
        className="min-h-screen overflow-x-clip [&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_video]:max-w-full [&_video]:h-auto [&_canvas]:max-w-full [&_svg]:max-w-full [&_iframe]:max-w-full [&_iframe]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground">
        {title}
      </h1>
      <div
        className="mt-8 prose prose-neutral max-w-none text-foreground [&_a]:text-[#5858E2] [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal"
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
    </div>
  );
}
