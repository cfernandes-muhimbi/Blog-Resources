import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class BubblePopGame implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;
    private _userCount: number = 0;
    private _initialTime: number = 30;
    private _selectedDifficulty: string = "medium";

    constructor() {}

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;

        this.setGameSettings(context);

        this._container.innerHTML = `<iframe id="bubbleGameFrame" style="width: 100%; height: 500px; border: none;" sandbox="allow-scripts allow-same-origin"></iframe>`;

        const iframe = this._container.querySelector("iframe") as HTMLIFrameElement;
        const doc = iframe.contentDocument || iframe.contentWindow!.document;

        doc.open();
        doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Game</title></head><body></body></html>`);
        doc.close();

        this.addStyles(doc);
        this.addMarkup(doc);
        this.addScript(doc);
    }

    private setGameSettings(context: ComponentFramework.Context<IInputs>) {
        this._initialTime = Number(context.parameters.CountdownTime?.raw) || 30;
        this._selectedDifficulty = context.parameters.Difficulty?.raw || "medium";
    }

    private addStyles(doc: Document) {
        const style = doc.createElement("style");
        style.textContent = `
            body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                background: #fff;
                overflow: hidden;
                position: relative;
            }
            .score-board {
                font-size: 1.5em;
                text-align: center;
                margin: 20px auto;
                padding: 15px;
                background: #f0f4f8;
                border-radius: 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                max-width: 500px;
            }
            .shadow {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6);
                justify-content: center;
                align-items: center;
            }
            .total-score {
                background: white;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                width: 90%;
                max-width: 300px;
            }
            .main-game {
                text-align: center;
                margin-top: 60px;
            }
            .start-btn, .restart {
                padding: 10px 20px;
                font-size: 1.2em;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 12px;
                cursor: pointer;
            }
            .restart {
                background: #0078d4;
            }
            .bubble {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                position: absolute;
                background: radial-gradient(circle, #ff6b6b, #d32f2f);
                box-shadow: 0 0 10px rgba(0,0,0,0.2);
                font-size: 24px;
                text-align: center;
                line-height: 50px;
                user-select: none;
            }
        `;
        doc.head.appendChild(style);
    }

    private addMarkup(doc: Document) {
        doc.body.innerHTML = `
            <div class="score-board">
                <p>You Popped <span class="score" style="color: #ff3e3e;">0</span> Bubbles</p>
                <p>Time Left: <span class="timer" style="color: #0078d4;">${this._initialTime}</span> sec</p>
            </div>

            <div class="shadow">
                <div class="total-score">
                    <div class="wrapper winner" style="display:none">
                        <h4>Time's Up!</h4>
                        <h4>You Popped <span class="score">0</span> Bubbles</h4>
                        <p>Play Again?</p>
                        <button class="restart">Yes</button>
                    </div>
                </div>
            </div>

            <div class="main-game">
                <h2>Ready to Start</h2>
                <button class="start-btn">Start</button>
            </div>
        `;
    }

    private addScript(doc: Document) {
        const script = doc.createElement("script");
        script.type = "text/javascript";
        script.textContent = `
            let noPop = 0;
            let timeLeft = ${this._initialTime};
            const timerDisplay = document.querySelector('.timer');
            const scores = document.querySelectorAll('.score');
            const shadow = document.querySelector('.shadow');
            const startBtn = document.querySelector('.start-btn');
            const restartBtn = document.querySelector('.restart');
            const winner = document.querySelector('.winner');
            const mainGame = document.querySelector('.main-game');
            let countdownTimer;
            let loop;

            const updateScores = () => {
                scores.forEach(score => score.textContent = noPop);
            };

            const createBubble = (speed) => {
                const emojis = ['🫧', '🎈', '💥', '🎉', '✨'];
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                bubble.style.left = Math.random() * (window.innerWidth - 50) + 'px';
                bubble.style.top = '0px';
                document.body.appendChild(bubble);

                let position = 0;
                const interval = setInterval(() => {
                    if (!bubble.parentElement) {
                        clearInterval(interval);
                        return;
                    }
                    if (position >= window.innerHeight + 100) {
                        clearInterval(interval);
                        bubble.remove();
                    } else {
                        position++;
                        bubble.style.top = position + 'px';
                    }
                }, speed);

                bubble.addEventListener('click', () => {
                    noPop++;
                    bubble.remove();
                    updateScores();
                });
            };

            const startCountdown = () => {
                countdownTimer = setInterval(() => {
                    timeLeft--;
                    timerDisplay.textContent = timeLeft;
                    if (timeLeft <= 0) {
                        clearInterval(countdownTimer);
                        clearInterval(loop);
                        shadow.style.display = 'flex';
                        winner.style.display = 'block';
                        updateScores();
                    }
                }, 1000);
            };

            const restartGame = () => {
                noPop = 0;
                timeLeft = ${this._initialTime};
                timerDisplay.textContent = timeLeft;
                document.querySelectorAll('.bubble').forEach(b => b.remove());
                shadow.style.display = 'none';
                winner.style.display = 'none';
                updateScores();
            };

            const startGame = () => {
                restartGame();
                mainGame.style.display = 'none';

                let speed = 12;
                let intervalDelay = 800;

                switch ('${this._selectedDifficulty}') {
                    case 'easy':
                        speed = 16;
                        intervalDelay = 1200;
                        break;
                    case 'hard':
                        speed = 8;
                        intervalDelay = 400;
                        break;
                }

                startCountdown();
                loop = setInterval(() => createBubble(speed), intervalDelay);
            };

            startBtn.addEventListener('click', startGame);
            restartBtn.addEventListener('click', startGame);
        `;
        doc.body.appendChild(script);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        this.setGameSettings(context);
    }

    public getOutputs(): IOutputs {
        return { UserCount: this._userCount };
    }

    public destroy(): void {}
}
