export const sudokuGameSettings = {
    rangeInput: document.getElementById('game-rotation-range'),
    outputElement: document.getElementById('game-rotation-range-value'),
    _rotationRate: localStorage.getItem('rotationRateStorage') ?? 15000,
    get rotationRate(){return this._rotationRate;},
    set rotationRate(value){
    this._rotationRate=value;
    localStorage.setItem('rotationRateStorage',this.rotationRate);
    },
    _solutionValidation: localStorage.getItem('solutionStorage') ?? 'wrongSolution', //Options are none, wrongSolution, or violatesRule
    get solutionValidation(){return this._solutionValidation},
    set solutionValidation(value){this._solutionValidation=value; localStorage.setItem('solutionStorage',value);
    },

    init() {

       document.getElementById('game-validation-selection').value=this.solutionValidation;
    
     

        const updateOutputValue = () => {
        this.outputElement.textContent = this.rangeInput.value+'s';
        };
        this.rangeInput.value=Math.round(this.rotationRate/1000);
        console.log(this.rangeInput.value);
        updateOutputValue();

        this.rangeInput.addEventListener('pointerup', () => {
        this.rotationRate = this.rangeInput.value * 1000;
        });

        this.rangeInput.addEventListener('input', () => {
            updateOutputValue();
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateOutputValue();
                    this.rangeInput.value=Math.round(this._rotationRate/1000);
                }
            });
        });

        observer.observe(this.rangeInput);
    }
}