//Validation
interface Validatable {
  value: string | number;
  required?: boolean; // same as required?: boolean | undefined;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(ValidatableInput: Validatable) {
  let isValid = true;
  if (ValidatableInput.required) {
    isValid = isValid && ValidatableInput.value.toString().trim().length !== 0;
  }
  if (
    ValidatableInput.minLength != null &&
    typeof ValidatableInput.value === "string"
  ) {
    isValid =
      isValid && ValidatableInput.value.length >= ValidatableInput.minLength;
  }
  if (
    ValidatableInput.maxLength != null &&
    typeof ValidatableInput.value === "string"
  ) {
    isValid =
      isValid && ValidatableInput.value.length <= ValidatableInput.maxLength;
  }
  if (
    ValidatableInput.min != null &&
    typeof ValidatableInput.value === "number"
  ) {
    isValid = isValid && ValidatableInput.value >= ValidatableInput.min;
  }
  if (
    ValidatableInput.max != null &&
    typeof ValidatableInput.value === "number"
  ) {
    isValid = isValid && ValidatableInput.value <= ValidatableInput.max;
  }
  return isValid;
}

//autobind decorator
function autobind(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalmethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalmethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.configure();
    this.attach();
  }

  private gatheruserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: enteredPeople,
      required: true,
      min: 1,
    };

    if (
      //   enteredTitle.trim().length === 0 ||
      //   enteredDescription.trim().length === 0 ||
      //   enteredPeople.trim().length === 0
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
    const userInput = this.gatheruserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      console.log(title, desc, people);
      this.clearInput();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const prjInput = new ProjectInput();
