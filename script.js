document.addEventListener('DOMContentLoaded', () => {

    // Initialising audio context
    const ctx = new (window.AudioContext||window.webkitAudioContext)();

    let oscSquare = ctx.createOscillator(); // Square synth
    let oscSine = ctx.createOscillator();   // Sine Synth
    let oscSaw = ctx.createOscillator();
    let modulator = ctx.createOscillator(); // LFO

    // Setting correct wave types for each oscillator
    oscSquare.type = "square";
    oscSine.type = "sine";
    oscSaw.type = "sawtooth";
    modulator.type = "sine";

    // Creating a gain node for each synth
    let gainSquare = ctx.createGain();
    let gainSine = ctx.createGain();
    let gainSaw = ctx.createGain();

    let convolver = ctx.createConvolver();

    fetch("https://cdn.glitch.com/29e6951a-6dd3-4b12-a147-f5d76d8de175%2Fimpact.mp3?v=1601224965303")
        .then(data => data.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(decodeAudio => {
            convolver.buffer = decodeAudio
        })

    let dryGain = ctx.createGain();
    dryGain.gain.value = 0.05;
    dryGain.connect(ctx.destination);

    // The gain nodes of the synths are connected to one "amp" node
    // Which is the final gain node before the output
    let amp = ctx.createGain();
    gainSquare.connect(amp);
    gainSine.connect(amp);
    gainSaw.connect(amp);
    amp.connect(convolver);
    amp.connect(dryGain);

    // The gain nodes of the synths are connected to one "dry" note
    // Which is the final gain node before the output
    let dry = ctx.createGain();
    gainSquare.connect(dry);
    gainSine.connect(dry);
    gainSaw.connect(dry);
    dry.connect(convolver);
    dry.connect(dryGain);

    let reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.15;
    convolver.connect(reverbGain);
    reverbGain.connect(ctx.destination);



    // The gain of amp is modulated by the LFO
    modulator.frequency.value = 20;
    modulator.connect(amp.gain);

    // Some default values
    oscSquare.frequency.value = 150;
    oscSine.frequency.value = 150;
    oscSaw.frequency.value = 150;
    oscSaw.detune.value = 10;
    gainSquare.gain.value = 0.4;
    gainSine.gain.value = 0.4;
    amp.gain.value = 0.5;
    dry.gain.value = 0.5;
    gainSaw.gain.value = 0.1;

    // Starting all the oscillators
    modulator.start();
    oscSquare.start();
    oscSine.start();
    oscSaw.start();




    let docElem = document.documentElement;
    let body = document.getElementsByTagName('body')[0];
    let width = docElem.clientWidth || body.clientWidth;
    let height = docElem.clientHeight|| body.clientHeight;

    window.addEventListener("resize", updateDimensions);
    document.addEventListener('click', playSound);
    document.addEventListener('click', addClickAnimation);

    function updateDimensions() {
        width = docElem.clientWidth || body.clientWidth;
        height = docElem.clientHeight|| body.clientHeight;
    }

    function playSound(event) {
        ctx.resume();
        let x = event.clientX/width;    // Get the horizontal coordinate
        let y = event.clientY/height;   // Get the vertical coordinate
        let p = (x+1-y)/2;              // diagonal scale (Bottom-L to Top-R)
        let d = (x+y)/2;                // diagonal scale (Top-L to Bottom-R)

        // horizontal position controls frequency
        let frequency = giveFrequency(x);
        oscSquare.frequency.value = frequency;
        oscSine.frequency.value = frequency;
        oscSaw.frequency.value = frequency;
        //vertical position cross-fades between square and sine
        gainSquare.gain.value = 0.4 * y;
        gainSine.gain.value = 0.8 * (1 - y);
        // first diagonal corresponds to tremolo
        amp.gain.value = amp.gain.value * p;
        dry.gain.value = dry.gain.value * (1-p);
        // second diagonal corresponds to de-tuning
        gainSaw.gain.value = 0.1 * d;

        oscSquare.connect(gainSquare);
        oscSine.connect(gainSine);
        oscSaw.connect(gainSine);
        setTimeout(() => {
            oscSquare.disconnect();
            oscSine.disconnect();
            oscSaw.disconnect();
        }, 250)
    }

    function addClickAnimation(event) {
        let x = event.clientX;    // Get the horizontal coordinate
        let y = event.clientY;   // Get the vertical coordinate

        const section = document.querySelector('section');
        let docElem = document.documentElement;
        let body = document.getElementsByTagName('body')[0];
        let width = docElem.clientWidth || body.clientWidth;
        let height = docElem.clientHeight|| body.clientHeight;

        for (let i = 0; i<10; i++) {
            const bleep = document.createElement('bleep');
            // dimensions of the  element
            let size = Math.random() * 20;
            bleep.style.width = 10 + size + 'px';
            bleep.style.height = 10 + size + 'px';

            // position of the square. innerHeight and innerWidth are
            // the height and width of the window's content area.
            bleep.style.left = x + 'px';
            bleep.style.top = y + 'px';

            bleep.style.setProperty('--movAmtX',(2000 * Math.random() - 1000) + '%');
            bleep.style.setProperty('--movAmtY',(2000 * Math.random() - 1000) + '%');

            // appendChild is a method to append an item in a list.
            // Here, an item "square" is added to the element 'section'
            section.appendChild(bleep)

            // remove square after 5s
            setTimeout(() => {
                bleep.remove()
            }, 500)
        }
    }

    function giveFrequency(sliderValue){
        let frequency;
        if (sliderValue < 0.2) {
            frequency = 146;
        } else if (sliderValue < 0.4) {
            frequency = 174;
        } else if (sliderValue < 0.6) {
            frequency = 196;
        } else if (sliderValue < 0.8) {
            frequency = 220;
        } else {
            frequency = 261;
        }
        return frequency;
    }


})