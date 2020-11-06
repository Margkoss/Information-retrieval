import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { MoviesPageRoutingModule } from "./movies-routing.module";

import { MoviesPage } from "./movies.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MoviesPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [MoviesPage],
})
export class MoviesPageModule {}
