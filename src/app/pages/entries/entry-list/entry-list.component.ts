import { Component, OnInit } from "@angular/core";
import { EntryService } from "../shared/entry.service";
import { Entry } from "../shared/entry.model";

@Component({
  selector: "app-entry-list",
  templateUrl: "./entry-list.component.html",
  styleUrls: ["./entry-list.component.css"],
})
export class EntryListComponent implements OnInit {
  entries: Entry[] = [];

  constructor(private service: EntryService) {}

  ngOnInit() {
    this.service.getAll().subscribe(
      (lanctos) => (this.entries = lanctos),
      (error) => alert("Errp ap carregar a lista de Lançamentos")
    );

  }

  deleteEntry(entry: Entry) {
    const mustDelete = confirm("Deseja realmente excluir o Lançamento ?");

    if (mustDelete) {
      this.service.delete(entry.id).subscribe(
        () =>
          (this.entries = this.entries.filter(
            (item) => item != entry
          )),
        () => alert("Erro ao excluir o Lançamento!")
      );
    }
  }
}
