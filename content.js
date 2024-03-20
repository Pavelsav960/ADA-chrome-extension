/**
 * Collects details of images without alt attributes on the page.
 * @returns {Array} An array of objects with details of images without alt text.
 */
function collectImagesWithoutAltDetails() {
  const images = document.querySelectorAll('img');
  return Array.from(images)
      .filter(img => !img.alt.trim())
      .map(img => ({ src: img.src }));
}

/**
* Checks for proper use of header tags on the page.
* @returns {Boolean} True if improperly nested headings are found, otherwise false.
*/
function checkForProperHeadings() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  let improperlyNested = false;

  headings.forEach(heading => {
      const level = parseInt(heading.tagName[1], 10);
      if (level > lastLevel + 1) {
          improperlyNested = true;
      }
      lastLevel = level;
  });

  return improperlyNested;
}

// Function to collect details of interactive elements that are potentially not keyboard accessible
function collectInaccessibleInteractiveElementsDetails() {
  const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
  return Array.from(interactiveElements).map(el => {
      // Try to create a meaningful description for each element
      const descriptionParts = [];
      if (el.id) descriptionParts.push(`id="${el.id}"`);
      if (el.className) descriptionParts.push(`class="${el.className}"`);
      if (el.name) descriptionParts.push(`name="${el.name}"`);
      if (el.type) descriptionParts.push(`type="${el.type}"`);
      if (el.tagName) descriptionParts.push(`tagName="${el.tagName.toLowerCase()}"`);
      // Use the tag name if no other identifiers are present
      const description = descriptionParts.length > 0 ? descriptionParts.join(', ') : el.tagName.toLowerCase();

      return description;
  });
}


/**
* Sends the results of the accessibility checks to the popup script.
*/
function performAccessibilityChecksAndSendResults() {
  const imagesWithoutAltDetails = collectImagesWithoutAltDetails();
  const improperlyNestedHeadings = checkForProperHeadings();
  const inaccessibleElementsDetails = collectInaccessibleInteractiveElementsDetails();

  chrome.runtime.sendMessage({
    totalImages: document.getElementsByTagName('img').length,
      totalImagesWithoutAlt: imagesWithoutAltDetails.length,
      improperlyNestedHeadings,
      inaccessibleElementsCount: inaccessibleElementsDetails.length,
      imagesWithoutAltDetails,
      inaccessibleElementsDetails
  });
}

// Initiate the checks and send results when the script is loaded.
performAccessibilityChecksAndSendResults();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightImage") {
      highlightImageBySrc(request.src);
  } else if (request.action === "adjustTextSize") {
      // Call function to adjust text size
      adjustTextSizeOnPage(request.textSize);
  }
});

/**
* Highlights an image on the page given its source URL.
* @param {String} src The source URL of the image to highlight.
*/
function highlightImageBySrc(src) {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
      if (img.src === src) {
          img.style.border = '5px solid red'; // Example of highlighting
          img.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
  });
}




/**
 * Adjusts the text size on the page.
 * @param {number} textSize The new text size to set.
 */
function adjustTextSizeOnPage(textSize) {
  // Adjusts the font size of the body element and potentially other elements as needed
  document.body.style.fontSize = textSize + 'px'; // You might choose 'em' or '%' based on your slider's scale

  // Optionally, adjust text size in other elements that do not inherit body's font size directly
  const elementsToAdjust = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span, a'); // Add other selectors as needed
  elementsToAdjust.forEach(element => {
      element.style.fontSize = textSize + 'px'; // Adjust accordingly
  });
}

/**
* Highlights an image on the page given its source URL.
* @param {String} src The source URL of the image to highlight.
*/
function highlightImageBySrc(src) {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
      if (img.src === src) {
          img.style.border = '5px solid red'; // Example of highlighting
          img.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
  });
}