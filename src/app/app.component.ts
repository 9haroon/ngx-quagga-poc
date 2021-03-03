import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, Renderer2, ContentChild } from '@angular/core';
import Quagga, { QuaggaJSConfigObject, QuaggaJSResultObject } from '@ericblade/quagga2';

import { BarcodeScannerLivestreamComponent } from "ngx-barcode-scanner";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'ngx-quagga-poc';
  @ViewChild(BarcodeScannerLivestreamComponent, {static: false}) barcodeScanner?: BarcodeScannerLivestreamComponent
 	@ViewChild('deviceSelection') deviceSelection?: ElementRef
  barcodeValue: string = '';
  private configQuagga: QuaggaJSConfigObject = {
    inputStream: {
      constraints: {
        facingMode: 'environment' // restrict camera type
      },
      area: { // defines rectangle of the detection
        top: '40%',    // top offset
        right: '0%',  // right offset
        left: '0%',   // left offset
        bottom: '40%'  // bottom offset
      },
    },
    decoder: {
      readers: ['ean_reader'] // restrict code types
    },
  }

  constructor(private renderer: Renderer2) {}
  
  ngAfterViewInit(): void {
    if (!navigator.mediaDevices || !(typeof navigator.mediaDevices.getUserMedia === 'function')) {
      alert('getUserMedia is not supported');
      return;
    }
    console.log('deviceSelection', this.deviceSelection)
    // this.barcodeScanner!.start();
  	Quagga.init(this.configQuagga, (err) => {
  		if (err) {
	      console.log(`QuaggaJS could not be initialized, err: ${err}`);
	    } else {
	      Quagga.start();
	      Quagga.onDetected((res) => {
	        window.alert(`code: ${res.codeResult.code}`);
	      })
	    }
  	})
  	let streamLabel = Quagga.CameraAccess.getActiveStreamLabel();
  	console.log('streamLabel', streamLabel)
  	const _self = this
  	Quagga.CameraAccess.enumerateVideoDevices()
    .then(function(devices) {
    	console.log('devices', devices)
    	devices.forEach(function(device) {
        var $option = document.createElement("option");
        $option.value = device.deviceId;
        $option.appendChild(document.createTextNode(_self.pruneText(device.label || device.deviceId)));
        $option.selected = streamLabel === device.label;
        _self.deviceSelection!.nativeElement.appendChild($option);
    });
    })
  }

  pruneText(text: string) {
    return text.length > 30 ? text.substr(0, 30) : text;
  }

  onValueChanges(result: QuaggaJSResultObject) {
    this.barcodeValue = result.codeResult.code as string;
    alert(this.barcodeValue)
  }
 
  onStarted(started: boolean) {
    alert(started)
  }

}

