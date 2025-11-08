/**
 * Formats a story to make the question prompt bold/highlighted
 * Questions start with 📝 emoji
 */
export function formatStory(story: string) {
  // Check if story starts with question marker
  if (story.startsWith("📝 ")) {
    // Split by double newline to separate question from answer
    const parts = story.split("\n\n");

    if (parts.length >= 2) {
      const question = parts[0].replace("📝 ", "");
      const answer = parts.slice(1).join("\n\n");

      return (
        <>
          <div className="bg-orange-50 border-l-4 border-primary p-4 mb-4 rounded-r-lg">
            <p className="text-primary font-bold text-xl leading-relaxed">
              📝 {question}
            </p>
          </div>
          <p className="text-text text-xl leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </>
      );
    }
  }

  // No question, return normal text
  return (
    <p className="text-text text-xl leading-relaxed whitespace-pre-wrap">
      {story}
    </p>
  );
}

/**
 * Gets preview text for story cards (home page)
 * Removes question marker for cleaner preview
 */
export function getStoryPreview(
  story: string,
  maxLength: number = 100
): string {
  let previewText = story;

  // If has question, extract just the answer part for preview
  if (story.startsWith("📝 ")) {
    const parts = story.split("\n\n");
    if (parts.length >= 2) {
      previewText = parts.slice(1).join("\n\n");
    }
  }

  // Truncate if needed
  if (previewText.length > maxLength) {
    return previewText.substring(0, maxLength) + "...";
  }

  return previewText;
}
