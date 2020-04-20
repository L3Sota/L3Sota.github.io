module.exports = function(eleventyConfig) {
  // Eleventy doesn't care for css files
  eleventyConfig.addPassthroughCopy("css");
};
