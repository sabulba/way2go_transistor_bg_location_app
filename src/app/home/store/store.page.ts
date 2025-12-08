import {Component, inject, OnInit} from '@angular/core';
import {IonContent} from "@ionic/angular/standalone";
import {IonicModule} from "@ionic/angular";
import {BgLocationService} from "../../services/bg-location";

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
  imports: [
    IonicModule
  ]
})
export class StorePage implements OnInit {

  location:any | null;
  bg= inject(BgLocationService);
  constructor() { }

  ngOnInit() {
    this.location = this.bg.currentLocation;
  }

}
