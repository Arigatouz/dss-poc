import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgxPopperjsPlacements} from "ngx-popperjs";

@Component({
  selector: 'app-form', templateUrl: './form.component.html', styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  public form!: FormGroup;
  public selectedRecipientNeighbors: number[] = [];
  @ViewChildren("formGroup") recipientGroupsUi!: QueryList<ElementRef>;

  constructor(private renderer: Renderer2, private fb: FormBuilder) {
  }

  get popperDropdownPosition() {
    return NgxPopperjsPlacements.RIGHT;
  }

  ngOnInit() {
    this.constructForm();
  }

  toggleGroupUi(formGroup: HTMLDivElement): void {
    if (formGroup.classList.contains("form-group--active")) {
      this.renderer.removeClass(formGroup, "form-group--active");
    } else {
      this.renderer.addClass(formGroup, "form-group--active");
    }
  }

  setRecipientGroupUiActive(recipientIndex: number) {
    this.renderer.addClass(this.recipientGroupsUi.get(recipientIndex)?.nativeElement, "form-group--active");
  }

  constructForm(): void {
    this.form = this.fb.group({
      recipients: this.fb.array([this.constructRecipient(), this.constructRecipient(), this.constructRecipient(),])
    });
  }

  constructRecipient(): FormGroup {
    return this.fb.group({
      dataRows: this.fb.array([this.constructDataRow(),])
    });
  }

  constructDataRow(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['review']
    });
  }

  addRecipient(): void {
    const recipient = this.constructRecipient();
    this.recipients.push(recipient);
  }

  addDataRow(recipientIndex: number): void {
    const dataRow = this.constructDataRow();
    this.getDataRowsOfRecipient(recipientIndex).push(dataRow);
  }

  deleteDataRowFromRecipient(dataRowIndex: number, recipientIndex: number): void {
    const recipientDataRows = this.getDataRowsOfRecipient(recipientIndex);
    recipientDataRows.removeAt(dataRowIndex);
    if (recipientDataRows.length === 0) {
      this.deleteRecipient(recipientIndex);
    }
  }

  deleteRecipient(recipientIndex: number): void {
    this.recipients.removeAt(recipientIndex);
  }

  getDataRowsControlsOfRecipient(recipient: any): AbstractControl[] {
    return (recipient.controls["dataRows"] as FormArray).controls;
  }

  setRecipientNeighborsIndexes(recipientIndex: number): void {
    this.selectedRecipientNeighbors = [...Array(this.recipients.length).keys()];
    this.selectedRecipientNeighbors.splice(recipientIndex, 1);
  }

  moveDataRowToRecipient(dataRowIndex: number, recipientIndex: number, neighborRecipientIndex: number): void {
    this.getDataRowsOfRecipient(neighborRecipientIndex).push(this.getDataRowsOfRecipient(recipientIndex).at(dataRowIndex));
    this.deleteDataRowFromRecipient(dataRowIndex, recipientIndex);
    this.setRecipientGroupUiActive(neighborRecipientIndex);
  }

  get recipients(): FormArray {
    return (this.form.get("recipients") as FormArray);
  }

  private getDataRowsOfRecipient(recipientIndex: number): FormArray {
    return (this.recipients.at(recipientIndex).get("dataRows") as FormArray);
  }
}
