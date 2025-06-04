//src\app\shared\shared.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf, *ngFor

@Component({
  standalone: true,
  selector: 'app-faq',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.css'],
  imports: [CommonModule], // Importa CommonModule para las directivas estructurales
})
export class SharedComponent implements OnInit {
  // Datos de las preguntas frecuentes directamente en el componente
  faqs = [
    {
      id: 1,
      question: '¿Cómo alquilo una máquina?',
      answer:
        'Para alquilar una máquina es necesario contar con une cuenta no restringida, navegando a la sección de Catálogo, seleccionando la máquina deseada y eligiendo las fechas de alquiler. Luego, sigue los pasos para completar la reserva.',
    },
    {
      id: 2,
      question: '¿Cuáles son los métodos de pago aceptados?',
      answer: 'Actualmente aceptamos pagos con mercadoPago o en efectivo',
    },
    {
      id: 3,
      question: '¿Puedo cancelar una reserva?',
      answer:
        'Sí, puedes cancelar una reserva. Sin embargo, ten en cuenta que se aplicarán cargos de cancelación según nuestra política.',
    },
    {
      id: 4,
      question: '¿Qué hago si la máquina presenta un problema?',
      answer:
        'Si la máquina alquilada presenta algún problema, por favor, contáctanos inmediatamente. Te asistiremos para resolver la situación lo antes posible.',
    },
    {
      id: 5,
      question: '¿Ofrecen servicio de entrega y recogida?',
      answer:
        'No, no ofrecemos servicio de entrega y recogida de la maquinaria. El cliente se compromete a buscar la máquina por sus propios medios.',
    },
  ];

  errorMessage: string | null = null; // Para el mensaje de "lista vacía"
  expandedFAQId: number | null = null; // Para controlar qué pregunta está expandida

  constructor() {}

  ngOnInit(): void {
    // Si la lista de FAQs estuviera vacía (ej. si viniera de una API y no hubiera datos)
    if (this.faqs.length === 0) {
      this.errorMessage =
        'Actualmente no hay preguntas frecuentes disponibles. Vuelve más tarde o contáctanos para más información.';
    }
  }

  /**
   * @description Alterna la visibilidad de la respuesta de una FAQ.
   * @param faqId El ID de la FAQ a expandir/contraer.
   */
  toggleFAQ(faqId: number): void {
    if (this.expandedFAQId === faqId) {
      this.expandedFAQId = null; // Contraer si ya está expandida
    } else {
      this.expandedFAQId = faqId; // Expandir la FAQ seleccionada
    }
  }
}
