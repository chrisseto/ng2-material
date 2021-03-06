import {Directive, Attribute, Host, SkipSelf, AfterContentChecked, ElementRef} from 'angular2/core';

import {ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {Input,Output} from 'angular2/core';

// TODO(jelbourn): validation (will depend on Forms API).
// TODO(jelbourn): textarea resizing
// TODO(jelbourn): max-length counter
// TODO(jelbourn): placeholder property

@Directive({
  selector: 'md-input-container',
  host: {
    '[class.md-input-has-value]': 'inputHasValue',
    '[class.md-input-focused]': 'inputHasFocus',
  }
})
export class MdInputContainer implements AfterContentChecked {
  // The MdInput or MdTextarea inside of this container.
  _input: MdInput = null;

  // Whether the input inside of this container has a non-empty value.
  inputHasValue: boolean = false;

  // Whether the input inside of this container has focus.
  inputHasFocus: boolean = false;

  constructor(@Attribute('id') id: string) {
  }

  ngAfterContentChecked() {
    // Enforce that this directive actually contains a text input.
    if (this._input === null) {
      throw 'No <input> or <textarea> found inside of <md-input-container>';
    }
  }

  /** Registers the child MdInput or MdTextarea. */
  registerInput(input) {
    if (this._input !== null) {
      throw 'Only one text input is allowed per <md-input-container>.';
    }

    this._input = input;
    this.inputHasValue = input.value != '';

    // Listen to input changes and focus events so that we can apply the appropriate CSS
    // classes based on the input state.
    ObservableWrapper.subscribe(input.mdChange, value => {
      this.inputHasValue = value != '';
    });

    ObservableWrapper.subscribe<boolean>(input.mdFocusChange,
                                         hasFocus => this.inputHasFocus = hasFocus);
  }
}


@Directive({
  selector: 'input[md-input],input.md-input,textarea[md-input],textarea.md-input',
  providers: [MdInputContainer],
  host: {
    'class': 'md-input',
    '(input)': 'updateValue($event)',
    '(focus)': 'setHasFocus(true)',
    '(blur)': 'setHasFocus(false)'
  }
})
export class MdInput {
  @Input() value: string;

  // Events emitted by this directive. We use these special 'md-' events to communicate
  // to the parent MdInputContainer.
  @Output() mdChange: EventEmitter<any> = new EventEmitter();
  @Output() mdFocusChange: EventEmitter<any> = new EventEmitter();

  constructor(@Attribute('value') value: string, @SkipSelf() @Host() container: MdInputContainer,
              @Attribute('id') id: string) {
    this.value = value == null ? '' : value;
    container.registerInput(this);
  }

  updateValue(event) {
    this.value = event.target.value;
    ObservableWrapper.callEmit(this.mdChange, this.value);
  }

  setHasFocus(hasFocus: boolean) {
    ObservableWrapper.callEmit(this.mdFocusChange, hasFocus);
  }
}
