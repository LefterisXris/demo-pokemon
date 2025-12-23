import { Component, OnInit } from '@angular/core';
import { GreetingService, Pokemon } from './services/greeting.service';

interface TableColumn {
  key: keyof Pokemon;
  label: string;
  width: number;
  visible: boolean;
  sortable: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  pokemons: Pokemon[] = [];
  filteredPokemons: Pokemon[] = [];
  selectedPokemon: Pokemon | null = null;
  loading: boolean = true;
  error: string = '';

  // View mode
  viewMode: 'cards' | 'table' = 'cards';

  // Table features
  searchTerm: string = '';
  sortColumn: keyof Pokemon | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: 80, visible: true, sortable: true },
    { key: 'name', label: 'Name', width: 150, visible: true, sortable: true },
    { key: 'explanation', label: 'Name Origin', width: 300, visible: true, sortable: true },
    { key: 'strength', label: 'Strength', width: 120, visible: true, sortable: true },
    { key: 'powers', label: 'Powers', width: 250, visible: true, sortable: false },
    { key: 'tips', label: 'Catching Tips', width: 250, visible: true, sortable: false }
  ];

  // Column resizing
  resizingColumn: TableColumn | null = null;
  resizeStartX: number = 0;
  resizeStartWidth: number = 0;

  // Column reordering
  draggedColumn: TableColumn | null = null;

  // Create Pokemon modal
  showCreateModal: boolean = false;
  newPokemon: Partial<Pokemon> = {
    name: '',
    explanation: '',
    strength: 0,
    powers: [],
    picture: '',
    tips: []
  };
  newPower: string = '';
  newTip: string = '';

  // Edit Pokemon modal
  showEditModal: boolean = false;
  editingPokemon: Pokemon | null = null;
  editPower: string = '';
  editTip: string = '';

  constructor(private greetingService: GreetingService) {}

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.loading = true;
    this.error = '';

    this.greetingService.getPokemons().subscribe({
      next: (pokemons: Pokemon[]) => {
        this.pokemons = pokemons;
        this.filteredPokemons = [...pokemons];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pokemons from backend';
        this.loading = false;
        console.error('Error loading pokemons:', err);
      }
    });
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'cards' ? 'table' : 'cards';
  }

  selectPokemon(pokemon: Pokemon): void {
    this.selectedPokemon = pokemon;
  }

  closeDetail(): void {
    this.selectedPokemon = null;
  }

  // Search and filter
  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredPokemons = [...this.pokemons];
    } else {
      this.filteredPokemons = this.pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(term) ||
        pokemon.explanation.toLowerCase().includes(term) ||
        pokemon.powers.some(p => p.toLowerCase().includes(term)) ||
        pokemon.tips.some(t => t.toLowerCase().includes(term))
      );
    }

    // Reapply sorting after filtering
    if (this.sortColumn) {
      this.applySort();
    }
  }

  // Sorting
  sort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.applySort();
  }

  private applySort(): void {
    if (!this.sortColumn) return;

    this.filteredPokemons.sort((a, b) => {
      const aVal = a[this.sortColumn!];
      const bVal = b[this.sortColumn!];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable || this.sortColumn !== column.key) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  // Column resizing
  startResize(event: MouseEvent, column: TableColumn): void {
    event.preventDefault();
    this.resizingColumn = column;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = column.width;

    const mouseMoveHandler = (e: MouseEvent) => this.onResize(e);
    const mouseUpHandler = () => this.stopResize(mouseMoveHandler, mouseUpHandler);

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  private onResize(event: MouseEvent): void {
    if (!this.resizingColumn) return;

    const diff = event.clientX - this.resizeStartX;
    const newWidth = Math.max(50, this.resizeStartWidth + diff);
    this.resizingColumn.width = newWidth;
  }

  private stopResize(mouseMoveHandler: any, mouseUpHandler: any): void {
    this.resizingColumn = null;
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  }

  // Column reordering
  onDragStart(event: DragEvent, column: TableColumn): void {
    this.draggedColumn = column;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetColumn: TableColumn): void {
    event.preventDefault();

    if (!this.draggedColumn || this.draggedColumn === targetColumn) {
      this.draggedColumn = null;
      return;
    }

    const draggedIndex = this.columns.indexOf(this.draggedColumn);
    const targetIndex = this.columns.indexOf(targetColumn);

    this.columns.splice(draggedIndex, 1);
    this.columns.splice(targetIndex, 0, this.draggedColumn);

    this.draggedColumn = null;
  }

  // Column visibility toggle
  toggleColumnVisibility(column: TableColumn): void {
    column.visible = !column.visible;
  }

  // Display helpers
  getCardColor(strength: number): string {
    if (strength >= 95) return '#FF1744'; // Red - Legendary
    if (strength >= 90) return '#FF6D00'; // Deep Orange - Very Strong
    if (strength >= 85) return '#FFA000'; // Amber - Strong
    if (strength >= 80) return '#FFD600'; // Yellow - Above Average
    if (strength >= 70) return '#64DD17'; // Light Green - Average
    return '#00C853'; // Green - Below Average
  }

  getStrengthLabel(strength: number): string {
    if (strength >= 95) return 'Legendary';
    if (strength >= 90) return 'Very Strong';
    if (strength >= 85) return 'Strong';
    if (strength >= 80) return 'Above Average';
    if (strength >= 70) return 'Average';
    return 'Below Average';
  }

  formatArrayValue(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value?.toString() || '';
  }

  // Create Pokemon modal methods
  openCreateModal(): void {
    this.showCreateModal = true;
    this.resetNewPokemon();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetNewPokemon();
  }

  resetNewPokemon(): void {
    this.newPokemon = {
      name: '',
      explanation: '',
      strength: 0,
      powers: [],
      picture: '',
      tips: []
    };
    this.newPower = '';
    this.newTip = '';
  }

  addPower(): void {
    if (this.newPower.trim()) {
      if (!this.newPokemon.powers) {
        this.newPokemon.powers = [];
      }
      this.newPokemon.powers.push(this.newPower.trim());
      this.newPower = '';
    }
  }

  removePower(index: number): void {
    if (this.newPokemon.powers) {
      this.newPokemon.powers.splice(index, 1);
    }
  }

  addTip(): void {
    if (this.newTip.trim()) {
      if (!this.newPokemon.tips) {
        this.newPokemon.tips = [];
      }
      this.newPokemon.tips.push(this.newTip.trim());
      this.newTip = '';
    }
  }

  removeTip(index: number): void {
    if (this.newPokemon.tips) {
      this.newPokemon.tips.splice(index, 1);
    }
  }

  submitNewPokemon(): void {
    if (!this.newPokemon.name || !this.newPokemon.strength) {
      alert('Name and Strength are required fields');
      return;
    }

    this.greetingService.createPokemon(this.newPokemon).subscribe({
      next: (createdPokemon: Pokemon) => {
        this.pokemons.push(createdPokemon);
        this.filteredPokemons = [...this.pokemons];
        this.closeCreateModal();
      },
      error: (err) => {
        console.error('Error creating pokemon:', err);
        alert('Failed to create pokemon. Please try again.');
      }
    });
  }

  // Edit Pokemon modal methods
  openEditModal(pokemon: Pokemon): void {
    this.editingPokemon = JSON.parse(JSON.stringify(pokemon));
    this.showEditModal = true;
    this.editPower = '';
    this.editTip = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingPokemon = null;
    this.editPower = '';
    this.editTip = '';
  }

  addEditPower(): void {
    if (this.editPower.trim() && this.editingPokemon) {
      if (!this.editingPokemon.powers) {
        this.editingPokemon.powers = [];
      }
      this.editingPokemon.powers.push(this.editPower.trim());
      this.editPower = '';
    }
  }

  removeEditPower(index: number): void {
    if (this.editingPokemon && this.editingPokemon.powers) {
      this.editingPokemon.powers.splice(index, 1);
    }
  }

  addEditTip(): void {
    if (this.editTip.trim() && this.editingPokemon) {
      if (!this.editingPokemon.tips) {
        this.editingPokemon.tips = [];
      }
      this.editingPokemon.tips.push(this.editTip.trim());
      this.editTip = '';
    }
  }

  removeEditTip(index: number): void {
    if (this.editingPokemon && this.editingPokemon.tips) {
      this.editingPokemon.tips.splice(index, 1);
    }
  }

  submitEditPokemon(): void {
    if (!this.editingPokemon || !this.editingPokemon.name || !this.editingPokemon.strength) {
      alert('Name and Strength are required fields');
      return;
    }

    this.greetingService.updatePokemon(this.editingPokemon.id, this.editingPokemon).subscribe({
      next: (updatedPokemon: Pokemon) => {
        const index = this.pokemons.findIndex(p => p.id === updatedPokemon.id);
        if (index !== -1) {
          this.pokemons[index] = updatedPokemon;
          this.filteredPokemons = [...this.pokemons];
        }
        this.closeEditModal();
        this.closeDetail();
      },
      error: (err) => {
        console.error('Error updating pokemon:', err);
        alert('Failed to update pokemon. Please try again.');
      }
    });
  }

  // Delete Pokemon
  deletePokemon(pokemon: Pokemon): void {
    if (!confirm(`Are you sure you want to delete ${pokemon.name}? This action cannot be undone.`)) {
      return;
    }

    this.greetingService.deletePokemon(pokemon.id).subscribe({
      next: () => {
        this.pokemons = this.pokemons.filter(p => p.id !== pokemon.id);
        this.filteredPokemons = [...this.pokemons];
        this.closeDetail();
      },
      error: (err) => {
        console.error('Error deleting pokemon:', err);
        alert('Failed to delete pokemon. Please try again.');
      }
    });
  }
}
