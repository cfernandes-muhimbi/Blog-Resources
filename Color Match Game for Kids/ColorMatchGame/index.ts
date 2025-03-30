// import { IInputs, IOutputs } from "./generated/ManifestTypes";

// export class ColorMatchGame implements ComponentFramework.StandardControl<IInputs, IOutputs> {
//     private container: HTMLDivElement;
//     private notifyOutputChanged: () => void;
//     private gameCompleted: boolean = false;

//     constructor() {}

//     public init(
//         context: ComponentFramework.Context<IInputs>,
//         notifyOutputChanged: () => void,
//         state: ComponentFramework.Dictionary,
//         container: HTMLDivElement
//     ): void {
//         this.container = container;
//         // Ensure iframe fills the space
//         container.style.width = "100%";
//         container.style.height = "100vh";
//         container.style.overflow = "auto"; // Just in case content spills
//         container.style.display = "flex";
//         container.style.justifyContent = "center";
//         this.notifyOutputChanged = notifyOutputChanged;

//         this.container.innerHTML = `
//             <div class="color-match-wrapper">
//                 <h1>🍌 Drag the Fruit to the Matching Color Box 🍎</h1>
//                 <div id="counter">Fruits Remaining: <span id="fruitCount">0</span></div>
//                 <div id="timer">Time: <span id="timeElapsed">0</span> sec</div>
//                 <div class="game-area" id="fruit-container"></div>
//                 <div class="game-area">
//                     ${['yellow', 'red', 'green', 'blue', 'orange', 'purple'].map(color =>
//                         `<div class="color-box color-${color}" data-color="${color}">${color.charAt(0).toUpperCase() + color.slice(1)}</div>`
//                     ).join('')}
//                 </div>
//             </div>
//         `;

//         const itemCount = context.parameters.NumberOfItems.raw ?? 10;
//         this.initializeGame(itemCount);
//     }

//     private initializeGame(itemCount: number): void {
//         const fruitContainer = this.container.querySelector('#fruit-container') as HTMLElement;
//         const counter = this.container.querySelector('#fruitCount')!;
//         const timeDisplay = this.container.querySelector('#timeElapsed')!;

//         let timeElapsed = 0;
//         const timerInterval = setInterval(() => {
//             timeElapsed++;
//             timeDisplay.textContent = timeElapsed.toString();
//         }, 1000);

//         type FruitColor = 'red' | 'green' | 'yellow' | 'blue' | 'orange' | 'purple';

//         const emojiColorMap: Record<FruitColor, string[]> = {
//             red: ['🍎', '🍒', '🍓'],
//             green: ['🥝', '🥒', '🥦'],
//             yellow: ['🍌', '🍋', '🌽'],
//             blue: ['🫐', '🟦', '🔷'],
//             orange: ['🍊', '🥕', '🟧'],
//             purple: ['🍇', '🍆', '🟪']
//         };

//         const colors = Object.keys(emojiColorMap) as FruitColor[];

//         for (let i = 0; i < itemCount; i++) {
//             const color = colors[i % colors.length];
//             const emojiOptions = emojiColorMap[color];
//             const emoji = document.createElement('div');
//             emoji.className = 'fruit';
//             emoji.setAttribute('draggable', 'true');
//             emoji.id = `emoji-${i}`;
//             emoji.textContent = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
//             emoji.setAttribute('data-color', color);

//             emoji.addEventListener('dragstart', (ev: DragEvent) => {
//                 ev.dataTransfer?.setData('text', emoji.id);
//             });

//             fruitContainer.appendChild(emoji);
//         }

//         const allowDrop = (ev: DragEvent) => {
//             ev.preventDefault();
//         };

//         const drop = (ev: DragEvent) => {
//             ev.preventDefault();
//             const fruitId = ev.dataTransfer?.getData('text');
//             const fruit = this.container.querySelector(`#${fruitId}`) as HTMLElement;
//             const target = ev.currentTarget as HTMLElement;
//             const targetColor = target.getAttribute('data-color');
//             const fruitColor = fruit?.getAttribute('data-color');

//             if (targetColor === fruitColor && fruit && !target.contains(fruit)) {
//                 const sound = this.container.querySelector('#correctSound') as HTMLAudioElement;
//                 sound?.play();
//                 fruit.classList.add('dancing');
//                 setTimeout(() => {
//                     fruit.remove();
//                     updateCounter();
//                 }, 1000);
//             }
//         };

//         const updateCounter = () => {
//             const remaining = this.container.querySelectorAll('.fruit').length;
//             counter.textContent = remaining.toString();
//             if (remaining === 0) {
//                 clearInterval(timerInterval);
//                 this.gameCompleted = true;
//                 this.notifyOutputChanged();
//             }
//         };

//         const colorBoxes = Array.from(this.container.querySelectorAll('.color-box')) as HTMLElement[];
//         colorBoxes.forEach(box => {
//             box.addEventListener('dragover', allowDrop);
//             box.addEventListener('drop', drop);
//         });

//         updateCounter();
//     }

//     public updateView(context: ComponentFramework.Context<IInputs>): void {
//         // Not needed for now
//     }

//     public getOutputs(): IOutputs {
//         return {
//             GameCompleted: this.gameCompleted ? "true" : ""
//         };
//     }

//     public destroy(): void {
//         // Optional cleanup
//     }
// }
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class ColorMatchGame implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private notifyOutputChanged: () => void;
    private gameCompleted: boolean = false;

    constructor() {}

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;

        container.style.width = "100%";
        container.style.height = "100vh";
        container.style.overflow = "auto";
        container.style.display = "flex";
        container.style.justifyContent = "center";

        this.container.innerHTML = `
            <div class="color-match-wrapper">
                <h1>🍌 Drag the Fruit to the Matching Color Box 🍎</h1>
                <div id="counter">Fruits Remaining: <span id="fruitCount">0</span></div>
                <div id="timer">Time: <span id="timeElapsed">0</span> sec</div>
                <div class="game-area" id="fruit-container"></div>
                <div class="game-area">
                    ${['yellow', 'red', 'green', 'blue', 'orange', 'purple'].map(color =>
                        `<div class="color-box color-${color}" data-color="${color}">${color.charAt(0).toUpperCase() + color.slice(1)}</div>`
                    ).join('')}
                </div>
                <audio id="correctSound">
                    <source src="https://www.soundjay.com/button/sounds/button-09.mp3" type="audio/mp3" />
                </audio>
            </div>
        `;

        const itemCount = context.parameters.NumberOfItems.raw ?? 10;
        this.initializeGame(itemCount);
    }

    private initializeGame(itemCount: number): void {
        const fruitContainer = this.container.querySelector('#fruit-container') as HTMLElement;
        const counter = this.container.querySelector('#fruitCount')!;
        const timeDisplay = this.container.querySelector('#timeElapsed')!;

        let timeElapsed = 0;
        const timerInterval = setInterval(() => {
            timeElapsed++;
            timeDisplay.textContent = timeElapsed.toString();
        }, 1000);

        type FruitColor = 'red' | 'green' | 'yellow' | 'blue' | 'orange' | 'purple';

        const emojiColorMap: Record<FruitColor, string[]> = {
            red: ['🍎', '🍒', '🍓'],
            green: ['🥝', '🥒', '🥦'],
            yellow: ['🍌', '🍋', '🌽'],
            blue: ['🫐', '🟦', '🔷'],
            orange: ['🍊', '🥕', '🟧'],
            purple: ['🍇', '🍆', '🟪']
        };

        const colors = Object.keys(emojiColorMap) as FruitColor[];

        for (let i = 0; i < itemCount; i++) {
            const color = colors[i % colors.length];
            const emojiOptions = emojiColorMap[color];
            const emoji = document.createElement('div');
            emoji.className = 'fruit';
            emoji.setAttribute('draggable', 'true');
            emoji.id = `emoji-${i}`;
            emoji.textContent = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
            emoji.setAttribute('data-color', color);

            // Desktop drag support
            emoji.addEventListener('dragstart', (ev: DragEvent) => {
                ev.dataTransfer?.setData('text', emoji.id);
            });

            // iOS/iPadOS touch fallback
            emoji.addEventListener('touchstart', (e: TouchEvent) => {
                const touch = e.touches[0];
                const ghost = emoji.cloneNode(true) as HTMLElement;
                ghost.style.position = 'absolute';
                ghost.style.opacity = '0.7';
                ghost.style.left = `${touch.clientX - 50}px`;
                ghost.style.top = `${touch.clientY - 50}px`;
                ghost.style.zIndex = '9999';
                ghost.id = 'ghost-drag';
                document.body.appendChild(ghost);

                const moveHandler = (moveEvent: TouchEvent) => {
                    const moveTouch = moveEvent.touches[0];
                    ghost.style.left = `${moveTouch.clientX - 50}px`;
                    ghost.style.top = `${moveTouch.clientY - 50}px`;
                };

                const endHandler = (endEvent: TouchEvent) => {
                    document.removeEventListener('touchmove', moveHandler);
                    document.removeEventListener('touchend', endHandler);
                    ghost.remove();

                    const touchEnd = endEvent.changedTouches[0];
                    const target = document.elementFromPoint(touchEnd.clientX, touchEnd.clientY) as HTMLElement;

                    const targetColor = target?.getAttribute('data-color');
                    const fruitColor = emoji.getAttribute('data-color');

                    if (target && target.classList.contains('color-box') && targetColor === fruitColor) {
                        const sound = this.container.querySelector('#correctSound') as HTMLAudioElement;
                        sound?.play();
                        emoji.classList.add('dancing');
                        setTimeout(() => {
                            emoji.remove();
                            updateCounter();
                        }, 1000);
                    }
                };

                document.addEventListener('touchmove', moveHandler);
                document.addEventListener('touchend', endHandler);
            });

            fruitContainer.appendChild(emoji);
        }

        const allowDrop = (ev: DragEvent) => {
            ev.preventDefault();
        };

        const drop = (ev: DragEvent) => {
            ev.preventDefault();
            const fruitId = ev.dataTransfer?.getData('text');
            const fruit = this.container.querySelector(`#${fruitId}`) as HTMLElement;
            const target = ev.currentTarget as HTMLElement;
            const targetColor = target.getAttribute('data-color');
            const fruitColor = fruit?.getAttribute('data-color');

            if (targetColor === fruitColor && fruit && !target.contains(fruit)) {
                const sound = this.container.querySelector('#correctSound') as HTMLAudioElement;
                sound?.play();
                fruit.classList.add('dancing');
                setTimeout(() => {
                    fruit.remove();
                    updateCounter();
                }, 1000);
            }
        };

        const updateCounter = () => {
            const remaining = this.container.querySelectorAll('.fruit').length;
            counter.textContent = remaining.toString();
            if (remaining === 0) {
                clearInterval(timerInterval);
                this.gameCompleted = true;
                this.notifyOutputChanged();
            }
        };

        const colorBoxes = Array.from(this.container.querySelectorAll('.color-box')) as HTMLElement[];
        colorBoxes.forEach(box => {
            box.addEventListener('dragover', allowDrop);
            box.addEventListener('drop', drop);
        });

        updateCounter();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // No dynamic updates needed
    }

    public getOutputs(): IOutputs {
        return {
            GameCompleted: this.gameCompleted ? "true" : ""
        };
    }

    public destroy(): void {
        // Cleanup if needed
    }
}
