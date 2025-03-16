/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/


var ngc_Lang = ngc_Lang || {};
ngc_Lang.cs = ngc_Lang.cs || {};
ngc_Lang.cs.bbbfly_map_control_draw = {
  draw: {
    toolbar: {
      actions: {
        title: '',
        text: 'Zrušit'
      },
      finish: {
        title: '',
        text: 'Ukončit'
    },
      undo: {
        title: '',
        text: 'Odstranit poslední bod'
      },
      buttons: {
        polyline: 'Kreslit čáru',
        polygon: 'Kreslit polygon',
        rectangle: 'Kreslit čtyřúhelník',
        circle: 'Kreslit kruh',
        circlemarker: 'Umístit kruh',
        marker: 'Umístit ikonu'
      }
    },
    handlers: {
      circle: {
        tooltip: {
          start: 'Klikněte a táhněte'
        },
        radius: 'Poloměr'
      },
      circlemarker: {
        tooltip: {
          start: 'Umístěte kliknutím'
        }
      },
      marker: {
        tooltip: {
          start: 'Umístěte kliknutím'
        }
      },
      polygon: {
        tooltip: {
          start: 'Klikněte',
          cont: 'Klikněte pro pokračování',
          end: 'Klikněte na první bod pro ukončení'
        }
      },
      polyline: {
        error: '<strong>Chyba:</strong> hrany se nesmějí křížit!',
        tooltip: {
          start: 'Klikněte',
          cont: 'Klikněte pro pokračování',
          end: 'Klikněte na poslední bod pro ukončení'
        }
      },
      rectangle: {
        tooltip: {
          start: 'Klikněte a táhněte'
        }
      },
      simpleshape: {
        tooltip: {
          end: 'Ukončete uvolněním tlačítka'
        }
      }
    }
  },
  edit: {
    toolbar: {
      actions: {
        save: {
          title: '',
          text: 'Potvrdit'
        },
        cancel: {
          title: '',
          text: 'Zrušit'
        },
        clearAll: {
          title: '',
          text: 'Vše'
        }
      },
      buttons: {
        edit: 'Upravit',
        editDisabled: 'Není co upravit',
        remove: 'Odstranit',
        removeDisabled: 'Není co odstranit'
      }
    },
    handlers: {
      edit: {
        tooltip: {
          text: 'Upravte posunem bodu',
          subtext: ''
        }
      },
      remove: {
        tooltip: {
          text: 'Odstraňte kliknutím',
          subtext: ''
        }
      }
    }
  }
};