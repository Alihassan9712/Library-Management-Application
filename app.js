const APP_NAME = "Library Management System | Develop";
const STORAGE_KEY = "reading-room-books-v1";

const starterBooks = [
  {
    id: "starter-1",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    category: "Classic",
    checkedOut: false,
  },
  {
    id: "starter-2",
    title: "The Midnight Library",
    author: "Matt Haig",
    isbn: "9780525559474",
    category: "Fiction",
    checkedOut: true,
  },
  {
    id: "starter-3",
    title: "Educated",
    author: "Tara Westover",
    isbn: "",
    category: "Memoir",
    checkedOut: false,
  },
];

const elements = {
  form: document.querySelector("#book-form"),
  id: document.querySelector("#book-id"),
  title: document.querySelector("#title"),
  author: document.querySelector("#author"),
  isbn: document.querySelector("#isbn"),
  category: document.querySelector("#category"),
  formTitle: document.querySelector("#form-title"),
  submitButton: document.querySelector("#submit-button"),
  cancelEdit: document.querySelector("#cancel-edit"),
  formMessage: document.querySelector("#form-message"),
  search: document.querySelector("#search"),
  statusFilter: document.querySelector("#status-filter"),
  sortOrder: document.querySelector("#sort-order"),
  bookList: document.querySelector("#book-list"),
  emptyState: document.querySelector("#empty-state"),
  listCount: document.querySelector("#list-count"),
  totalCount: document.querySelector("#total-count"),
  availableCount: document.querySelector("#available-count"),
  checkedOutCount: document.querySelector("#checked-out-count"),
  storageMessage: document.querySelector("#storage-message"),
};

function readBooks() {
  try {
    const savedBooks = localStorage.getItem(STORAGE_KEY);
    if (savedBooks === null) {
      return [...starterBooks];
    }

    const parsedBooks = JSON.parse(savedBooks);
    if (!Array.isArray(parsedBooks)) {
      throw new Error("Saved library data must be a list.");
    }
    return parsedBooks;
  } catch (error) {
    elements.storageMessage.textContent =
      "Saved books could not be loaded. Check this browser's storage settings.";
    console.error("Unable to load the saved library.", error);
    return [...starterBooks];
  }
}

let books = readBooks();

function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    elements.storageMessage.textContent = "";
    return true;
  } catch (error) {
    elements.storageMessage.textContent =
      "Changes could not be saved. Check this browser's storage settings.";
    console.error("Unable to save the library.", error);
    return false;
  }
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderBook(book) {
  const card = document.createElement("article");
  card.className = "book-card";

  const details = document.createElement("div");
  details.append(
    createTextElement("h3", "book-title", book.title),
    createTextElement("p", "book-author", `by ${book.author}`),
  );

  const meta = document.createElement("div");
  meta.className = "book-meta";
  if (book.category) {
    meta.append(createTextElement("span", "book-tag", book.category));
  }
  if (book.isbn) {
    meta.append(createTextElement("span", "book-tag", `ISBN ${book.isbn}`));
  }
  meta.append(
    createTextElement(
      "span",
      `status-tag ${book.checkedOut ? "checked-out" : "available"}`,
      book.checkedOut ? "Checked out" : "Available",
    ),
  );
  details.append(meta);

  const actions = document.createElement("div");
  actions.className = "book-actions";

  const statusButton = createTextElement(
    "button",
    "action-button",
    book.checkedOut ? "Return" : "Check out",
  );
  statusButton.type = "button";
  statusButton.dataset.action = "toggle";
  statusButton.setAttribute(
    "aria-label",
    `${book.checkedOut ? "Return" : "Check out"} ${book.title}`,
  );

  const editButton = createTextElement("button", "action-button", "Edit");
  editButton.type = "button";
  editButton.dataset.action = "edit";
  editButton.setAttribute("aria-label", `Edit ${book.title}`);

  const deleteButton = createTextElement("button", "action-button delete", "Delete");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Delete ${book.title}`);

  actions.append(statusButton, editButton, deleteButton);
  card.append(details, actions);
  card.dataset.bookId = book.id;
  return card;
}

function getVisibleBooks() {
  const searchTerm = elements.search.value.trim().toLocaleLowerCase();
  const status = elements.statusFilter.value;
  return books
    .filter((book) => {
      const matchesSearch =
        book.title.toLocaleLowerCase().includes(searchTerm) ||
        book.author.toLocaleLowerCase().includes(searchTerm);
      const matchesStatus =
        status === "all" ||
        (status === "available" && !book.checkedOut) ||
        (status === "checked-out" && book.checkedOut);
      return matchesSearch && matchesStatus;
    })
    .sort((first, second) => {
      const order = first.title.localeCompare(second.title);
      return elements.sortOrder.value === "descending" ? -order : order;
    });
}

function render() {
  const visibleBooks = getVisibleBooks();
  elements.bookList.replaceChildren(...visibleBooks.map(renderBook));
  elements.emptyState.classList.toggle("is-hidden", visibleBooks.length > 0);
  elements.emptyState.querySelector("h3").textContent =
    books.length === 0 ? "Your shelf is waiting" : "No matching books";
  elements.emptyState.querySelector("p").textContent =
    books.length === 0
      ? "Add a book with the form to start your collection."
      : "Try a different search or status filter.";

  const available = books.filter((book) => !book.checkedOut).length;
  elements.totalCount.textContent = String(books.length);
  elements.availableCount.textContent = String(available);
  elements.checkedOutCount.textContent = String(books.length - available);
  elements.listCount.textContent = `${visibleBooks.length} ${
    visibleBooks.length === 1 ? "book" : "books"
  }`;
  document.title = APP_NAME;
}

function resetForm() {
  elements.form.reset();
  elements.id.value = "";
  elements.formTitle.textContent = "Add a book";
  elements.submitButton.textContent = "Add to collection";
  elements.cancelEdit.classList.add("is-hidden");
  elements.formMessage.textContent = "";
}

function beginEdit(book) {
  elements.id.value = book.id;
  elements.title.value = book.title;
  elements.author.value = book.author;
  elements.isbn.value = book.isbn;
  elements.category.value = book.category;
  elements.formTitle.textContent = "Edit book";
  elements.submitButton.textContent = "Save changes";
  elements.cancelEdit.classList.remove("is-hidden");
  elements.formMessage.textContent = "";
  elements.title.focus();
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const bookData = {
    title: elements.title.value.trim(),
    author: elements.author.value.trim(),
    isbn: elements.isbn.value.trim(),
    category: elements.category.value.trim(),
  };
  const editingId = elements.id.value;

  if (editingId) {
    books = books.map((book) =>
      book.id === editingId ? { ...book, ...bookData } : book,
    );
  } else {
    books.unshift({
      id: crypto.randomUUID(),
      ...bookData,
      checkedOut: false,
    });
  }

  if (saveBooks()) {
    resetForm();
  }
  render();
});

elements.cancelEdit.addEventListener("click", resetForm);
elements.search.addEventListener("input", render);
elements.statusFilter.addEventListener("change", render);
elements.sortOrder.addEventListener("change", render);

elements.bookList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const card = button.closest(".book-card");
  const book = books.find((item) => item.id === card.dataset.bookId);
  if (!book) {
    return;
  }

  switch (button.dataset.action) {
    case "toggle":
      books = books.map((item) =>
        item.id === book.id ? { ...item, checkedOut: !item.checkedOut } : item,
      );
      break;
    case "edit":
      beginEdit(book);
      return;
    case "delete":
      books = books.filter((item) => item.id !== book.id);
      if (elements.id.value === book.id) {
        resetForm();
      }
      break;
    default:
      return;
  }

  saveBooks();
  render();
});

render();
