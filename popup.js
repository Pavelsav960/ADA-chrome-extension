// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', function() {
  attachButtonListeners();
});

/**
* Attaches click event listeners to buttons in the popup.
*/
function attachButtonListeners() {
  const checkPageButton = document.getElementById('checkPage');
  if (checkPageButton) {
      checkPageButton.addEventListener('click', function() {
          requestContentScriptExecution();
      });
  }
}

/**
* Requests the execution of the content script on the current active tab.
*/
function requestContentScriptExecution() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          files: ['content.js']
      });
  });
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message) {
      displayResults(message);
  }
});

/**
* Displays the results from the content script in the popup's HTML.
* @param {Object} message The message received from the content script containing the check results.
*/
function displayResults(message) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;

  // Clear previous content
  resultsDiv.innerHTML = '';

  // Display summary information
  displaySummaryInformation(message, resultsDiv);

  // Dynamically create collapsible sections for detailed information
  if (message.imagesWithoutAltDetails && message.imagesWithoutAltDetails.length > 0) {
      resultsDiv.appendChild(createCollapsibleSection('Images Without Alt Text', message.imagesWithoutAltDetails));
  }

  if (message.inaccessibleElementsDetails && message.inaccessibleElementsDetails.length > 0) {
      resultsDiv.appendChild(createCollapsibleSection('Inaccessible Interactive Elements', message.inaccessibleElementsDetails));
  }
}

/**
* Creates and returns a DOM element for a collapsible section including a title and a list of items.
* @param {String} title The title of the section.
* @param {Array} items The items (image src or element details) to display in the section.
* @returns {HTMLElement} The collapsible section element.
*/
function createCollapsibleSection(title, items) {
  const section = document.createElement('div');
  section.className = 'section';

  const button = document.createElement('button');
  button.className = 'collapsible';
  button.textContent = title;
  button.addEventListener('click', function() {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
  });

  const content = document.createElement('div');
  content.className = 'content';
  content.style.display = 'none';

  const list = document.createElement('ul');
  items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.className = 'image-item';
      listItem.setAttribute('data-src', item.src);
      listItem.textContent = item.src;
      listItem.addEventListener('click', function() {
          highlightImageOnPage(item.src);
      });
      list.appendChild(listItem);
  });

  content.appendChild(list);
  section.appendChild(button);
  section.appendChild(content);

  return section;
}

/**
* Sends a message to the content script to highlight an image on the page.
* @param {String} src The source URL of the image to be highlighted.
*/
function highlightImageOnPage(src) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "highlightImage", src: src});
  });
}

/**
* Displays summary information at the top of the popup.
* @param {Object} message The results message from the content script.
* @param {HTMLElement} container The DOM element to append the summary information to.
*/
function displaySummaryInformation(message, container) {
  const summaryInfo = document.createElement('div');
  summaryInfo.className = 'summary';

  const totalImages = document.createElement('p');
  totalImages.textContent = `Total images: ${message.totalImages}`;
  summaryInfo.appendChild(totalImages);

  // Images without alt text
  const imagesWithoutAlt = document.createElement('p');
  imagesWithoutAlt.textContent = `Images without alt text: ${message.totalImagesWithoutAlt}`;
  summaryInfo.appendChild(imagesWithoutAlt);


  const improperlyNestedHeadings = document.createElement('p');
  improperlyNestedHeadings.textContent = `Improperly nested headings: ${message.improperlyNestedHeadings ? 'Yes' : 'No'}`;
  summaryInfo.appendChild(improperlyNestedHeadings);

  const inaccessibleElementsCount = document.createElement('p');
  inaccessibleElementsCount.textContent = `Interactive elements not keyboard accessible: ${message.inaccessibleElementsCount}`;
  summaryInfo.appendChild(inaccessibleElementsCount);
  container.appendChild(summaryInfo);

}
