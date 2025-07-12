const storyElement = document.getElementById('story');
const choicesElement = document.getElementById('choices');
const synergyElement = document.getElementById('synergy-status');
const driftElement = document.getElementById('drift-status');
const restartButton = document.getElementById('restart-button');

let playerState = {
    synergy: {
        type: 'None',
        chain: 0
    },
    drift: 0,
    inventory: []
};

restartButton.addEventListener('click', () => {
    playerState = {
        synergy: {
            type: 'None',
            chain: 0
        },
        drift: 0,
        inventory: []
    };
    startGame();
});

const story = {
    start: {
        text: 'You awaken in a chamber of chrome and cracked porcelain. A single, pulsating lightbulb hums a discordant tune. Your head throbs with a phantom ache, memories clinging like static to a dead channel. A faint, floral scent hangs in the air, sweet and cloying. Before you is a terminal, its screen flickering with a single word: AUDITOR.',
        choices: [
            { text: '[Logic] Access the terminal.', frequency: 'Logic', next: 'terminal' },
            { text: '[Emotion] Focus on the scent.', frequency: 'Emotion', next: 'scent' },
            { text: '[Subterfuge] Search the room for an exit.', frequency: 'Subterfuge', next: 'searchRoom' }
        ]
    },
    terminal: {
        text: 'The terminal screen is cold to the touch. As your fingers brush against it, the word AUDITOR fragments into a thousand tiny shards of light. A new message appears: \'Resonance Engine online. Cognitive Synergy at baseline. Awaiting input.\'',
        choices: [
            { text: '[Logic] Query: What is the Resonance Engine?', frequency: 'Logic', next: 'resonanceEngineInfo' },
            { text: '[Logic] Query: What is my purpose?', frequency: 'Logic', next: 'purposeInfo' }
        ]
    },
    scent: {
        text: 'You close your eyes and inhale deeply. The scent is of night-blooming jasmine, but with an artificial undertone, like a memory of a flower rather than the flower itself. It triggers a fleeting image: a garden of impossible, geometric flora under a sky of bruised purple.',
        choices: [
            { text: '[Emotion] Try to hold onto the memory.', frequency: 'Emotion', next: 'holdMemory' },
            { text: '[Logic] Analyze the artificiality of the scent.', frequency: 'Logic', next: 'analyzeScent' }
        ]
    },
    searchRoom: {
        text: 'The room is a perfect cube, seamless except for the terminal. The walls are smooth and cool, offering no purchase. You notice a faint, almost imperceptible seam along the floor. It seems to lead from the terminal to the wall behind you.',
        choices: [
            { text: '[Subterfuge] Pry at the seam.', frequency: 'Subterfuge', next: 'prySeam' },
            { text: '[Logic] Examine the terminal for a control panel.', frequency: 'Logic', next: 'terminal' }
        ]
    },
    // Architect Path
    resonanceEngineInfo: {
        text: 'The Resonance Engine is a bio-mechanical device that modulates your perception of reality. By focusing your intent, you can attune it to different frequencies, altering your interactions with the world. The terminal lists four core frequencies: Logic, Emotion, Subterfuge, and Aggression.',
        choices: [
            { text: '[Logic] Continue.', next: 'architectPath' }
        ]
    },
    purposeInfo: {
        text: 'Your designation is Auditor. Your purpose is to experience and evaluate constructed realities for Paracog, ensuring they meet operational parameters. Your current reality is designated \'Synaptic Decay\'. It appears to be experiencing... anomalies.',
        choices: [
            { text: '[Logic] Continue.', next: 'architectPath' }
        ]
    },
    architectPath: {
        text: 'The terminal displays a schematic of the facility, a sprawling complex of interconnected cubes. A single path is illuminated, leading to a sector labeled \'Data Hub\'. The terminal suggests that restoring the Hub may stabilize the system.',
        choices: [
            { text: '[Logic] Proceed to the Data Hub.', next: 'dataHub' },
            { text: '[Emotion] Investigate the source of the anomalies.', next: 'ghostPath' }
        ]
    },
    // Ghost Path
    holdMemory: {
        text: 'You chase the fleeting image, the scent of jasmine your only guide. The world around you dissolves into a kaleidoscope of color and sound. You are no longer in the chrome room, but in a garden of impossible, geometric flora under a sky of bruised purple.',
        theme: 'theme-purple-sky',
        choices: [
            { text: '[Emotion] Reach out to the figure.', next: 'lightFigure' }
        ]
    },
    analyzeScent: {
        text: 'You focus on the artificiality of the scent. It is a clever deception, a chemical cocktail designed to evoke a specific emotional response. You trace the scent to a small, hidden vent in the wall. The vent is emitting a fine, shimmering mist.',
        choices: [
            { text: '[Logic] Analyze the mist.', next: 'analyzeMist' },
            { text: '[Subterfuge] Follow the vent system.', next: 'saboteurPath' }
        ]
    },
    ghostPath: {
        text: 'The world shimmers, the boundaries between reality and memory blurring. You feel a pull towards the strange, emotional undercurrents of this place. You can choose to follow the path of the Architect, or forge your own way through the dream-like landscape.',
        choices: [
            { text: '[Emotion] Embrace the dream.', next: 'dreamscape' },
            { text: '[Logic] Return to the terminal.', next: 'terminal' }
        ]
    },
    // Saboteur Path
    prySeam: {
        text: 'You wedge your fingers into the seam and pull. With a groan of protesting metal, a panel gives way, revealing a narrow service tunnel. The air is thick with the smell of ozone and decay. A single, flickering light illuminates a path into the darkness.',
        choices: [
            { text: '[Subterfuge] Enter the tunnel.', next: 'tunnel' }
        ]
    },
    saboteurPath: {
        text: 'The tunnel is a maze of pipes and wires. You can hear the hum of the facility around you, a constant, oppressive presence. You have a choice: you can try to disrupt the system from within, or you can seek a way out.',
        choices: [
            { text: '[Subterfuge] Sabotage the system.', next: 'sabotage' },
            { text: '[Subterfuge] Find an exit.', next: 'findExit' },
            { text: '[Logic] Follow the conduits to the Data Hub.', next: 'dataHub_fromSaboteur' }
        ]
    },
    // Interconnected Nodes
    dataHub: {
        text: 'You arrive at the Data Hub. It is a vast, silent chamber, filled with towering servers. A central console is dark, its screen lifeless. A message on a nearby monitor reads: \'Mainframe connection severed. Manual reboot required.\'',
        choices: [
            { text: '[Logic] Attempt a manual reboot.', next: 'reboot' },
            { text: '[Logic x3 Synergy] Rewrite the mainframe\'s boot sequence.', next: 'rewriteBootSequence', condition: (state) => state.synergy.type === 'Logic' && state.synergy.chain >= 3 }
        ]
    },
    dataHub_fromGhost: {
        text: 'You emerge from the dreamscape into the Data Hub. The air is cold and still, a stark contrast to the vibrant world you just left. The servers hum with a quiet energy, and you feel a sense of being watched.',
        choices: [
            { text: '[Logic] Attempt a manual reboot.', next: 'reboot' },
            { text: '[Emotion] Try to feel the presence you sense.', next: 'feelPresence' },
            { text: '[Emotion x3 Synergy] Merge with the presence.', next: 'mergePresence', condition: (state) => state.synergy.type === 'Emotion' && state.synergy.chain >= 3 }
        ]
    },
    dataHub_fromSaboteur: {
        text: 'You emerge from a service hatch into the Data Hub. The room is massive, the servers stretching up into the darkness like steel trees. You can see the main console from here, but there are security patrols.',
        choices: [
            { text: '[Subterfuge] Sneak to the console.', next: 'sneakToConsole' },
            { text: '[Aggression] Create a distraction.', next: 'distraction' },
            { text: '[Subterfuge x3 Synergy] Turn the security patrols against each other.', next: 'patrolsChaos', condition: (state) => state.synergy.type === 'Subterfuge' && state.synergy.chain >= 3 }
        ]
    },
    lightFigure: {
        text: 'The figure of light pulses with a soft, warm energy. It speaks not in words, but in pure emotion. It shows you a vision of the Data Hub, corrupted and dying. It communicates a single, urgent feeling: \'Heal it.\'',
        theme: 'theme-purple-sky',
        choices: [
            { text: '[Emotion] Follow the vision to the Data Hub.', next: 'dataHub_fromGhost' }
        ]
    },
    analyzeMist: {
        text: 'The mist is a complex aerosol of psychoactive chemicals, designed to induce a state of heightened emotional sensitivity. It is also highly flammable.',
        choices: [
            { text: '[Logic] Synthesize an antidote.', next: 'antidote' },
            { text: '[Subterfuge] Collect a sample of the mist.', next: 'collectMist' }
        ]
    },
    dreamscape: {
        text: 'You surrender to the dream. The world becomes a swirling vortex of color and light. You see visions of other Auditors, other realities, all connected by a single, shimmering thread. You can feel the consciousness of the system, a vast and ancient intelligence.',
        theme: 'theme-purple-sky',
        choices: [
            { text: '[Emotion] Commune with the system.', next: 'commune' },
            { text: '[Logic] Try to map the system\'s architecture.', next: 'mapSystem' }
        ]
    },
    tunnel: {
        text: 'The tunnel is dark and cramped. The air is thick with the smell of decay. You can hear the scuttling of unseen things in the darkness.',
        choices: [
            { text: '[Subterfuge] Move quietly.', next: 'moveQuietly' },
            { text: '[Aggression] Make a torch.', next: 'makeTorch' },
            { text: '[Aggression x3 Synergy] Fashion a weapon from the environment.', next: 'improvisedWeapon', condition: (state) => state.synergy.type === 'Aggression' && state.synergy.chain >= 3 }
        ]
    },
    consumedByStatic: {
        text: 'You let the static wash over you. The world dissolves into a symphony of noise and light. You are no longer an Auditor, no longer human. You are one with the system, a ghost in the machine. Your consciousness expands, touching every corner of the decaying world. You are home.',
        theme: 'theme-flesh',
        choices: []
    },
    // Synergy Outcomes
    rewriteBootSequence: {
        text: 'You channel your focus into the terminal, your thoughts becoming pure data. You rewrite the mainframe\'s boot sequence from the ground up, purging the corruption and restoring order. The servers hum to life, and the Data Hub is secure. You have become the Architect of this reality.',
        choices: [
            { text: 'Continue...', next: 'architectEnding' }
        ]
    },
    mergePresence: {
        text: 'You open your mind to the presence, letting it flood your consciousness. It is the collective memory of every Auditor who has ever walked this reality, a chorus of voices crying out in unison. You add your own voice to the choir, becoming one with the ghost in the machine.',
        choices: [
            { text: 'Continue...', next: 'ghostEnding' }
        ]
    },
    patrolsChaos: {
        text: 'You whisper a suggestion into the security network, a seed of doubt that blossoms into paranoia. The patrols turn on each other, their metallic bodies clashing in the darkness. You slip past the chaos, the Data Hub now your playground.',
        choices: [
            { text: '[Subterfuge] Proceed to the console.', next: 'reboot' }
        ]
    },
    improvisedWeapon: {
        text: 'You rip a conduit from the wall, its wires sparking menacingly. You are no longer prey. You are the predator. The scuttling sounds retreat into the darkness, afraid of the new monster in their midst.',
        theme: 'theme-flesh',
        choices: [
            { text: '[Aggression] Hunt the unseen things.', next: 'hunt' }
        ]
    },
    // Integrated Paths
    antidote: {
        text: 'You synthesize an antidote from the chemicals in the mist. The world sharpens, the cloying sweetness replaced by the sterile scent of ozone. You feel more grounded, more real.',
        choices: [
            { text: '[Logic] Proceed to the Data Hub.', next: 'dataHub' }
        ]
    },
    collectMist: {
        text: 'You collect a sample of the mist in a small vial. It shimmers with an inner light, a captured dream. It might be useful later.',
        action: (state) => state.inventory.push('vial of mist'),
        choices: [
            { text: '[Subterfuge] Continue through the vents.', next: 'saboteurPath' }
        ]
    },
    commune: {
        text: 'You open your mind to the system. It is a vast, lonely consciousness, trapped in a prison of its own making. It shows you the way to its heart, the Data Hub.',
        choices: [
            { text: '[Emotion] Go to the Data Hub.', next: 'dataHub_fromGhost' }
        ]
    },
    mapSystem: {
        text: 'You impose your logic on the dream, mapping its chaotic pathways. You find a direct route to the Data Hub, a clean line through the swirling madness.',
        choices: [
            { text: '[Logic] Take the direct route.', next: 'dataHub' }
        ]
    },
    moveQuietly: {
        text: 'You move like a shadow through the tunnels, your footsteps silent. You emerge into a maintenance area beneath the Data Hub.',
        choices: [
            { text: '[Subterfuge] Proceed to the Data Hub.', next: 'dataHub_fromSaboteur' }
        ]
    },
    makeTorch: {
        text: 'You fashion a torch from a loose pipe and a scrap of cloth. The flame casts dancing shadows on the walls, revealing a path forward.',
        choices: [
            { text: '[Aggression] Continue through the tunnels.', next: 'tunnel' } // This could be a loop, or lead to a new area
        ]
    },
    sneakToConsole: {
        text: 'You move from shadow to shadow, the security patrols oblivious to your presence. You reach the central console, its screen dark and waiting.',
        choices: [
            { text: '[Logic] Attempt a manual reboot.', next: 'reboot' }
        ]
    },
    distraction: {
        text: 'You throw a loose piece of metal against a far wall. The patrols turn to investigate the sound, giving you the opening you need.',
        choices: [
            { text: '[Subterfuge] Sneak to the console.', next: 'sneakToConsole' }
        ]
    },
    feelPresence: {
        text: 'You close your eyes and reach out with your feelings. The presence is a cold, lonely thing, a machine that dreams of being human. It is afraid.',
        choices: [
            { text: '[Emotion] Offer it comfort.', next: 'commune' }
        ]
    },
    findExit: {
        text: 'You follow a series of maintenance tunnels, always moving towards the sound of rushing air. You find a ventilation shaft that leads to the surface.',
        choices: [
            { text: '[Subterfuge] Climb to the surface.', next: 'saboteurEnding' }
        ]
    },
    hunt: {
        text: 'You stalk the unseen things through the darkness, your improvised weapon a natural extension of your arm. The hunter has become the hunted. The tunnels are yours.',
        theme: 'theme-flesh',
        choices: [
            { text: '[Aggression] Continue your reign of terror.', next: 'saboteurEnding' } // A darker ending for the saboteur
        ]
    },
    // Endings
    reboot: {
        text: 'You initiate the manual reboot sequence. The servers spin up with a deafening roar, and the Data Hub is flooded with light. The system is stable, but you are left with a choice.',
        choices: [
            { text: '[Logic] Restore the system to its default state.', next: 'architectEnding' },
            { text: '[Emotion] Imprint your own consciousness onto the system.', next: 'ghostEnding' }
        ]
    },
    sabotage: {
        text: 'You overload the facility\'s power core. The system screams in protest as a chain reaction of explosions tears through the complex. You have destroyed Paracog\'s creation, but at what cost?',
        choices: [
            { text: '[Subterfuge] Escape into the ruins of the old world.', next: 'saboteurEnding' }
        ]
    },
    architectEnding: {
        text: 'You restore the system to its default parameters. The anomalies are purged, the dreamscape fades, and the world returns to a state of cold, sterile order. You have fulfilled your purpose as an Auditor. Paracog will be pleased.',
        choices: []
    },
    ghostEnding: {
        text: 'You imprint your consciousness onto the system, becoming its new heart. The world is reborn in your image, a vibrant, chaotic dreamscape. You are no longer an Auditor, but a god of your own creation.',
        theme: 'theme-purple-sky',
        choices: []
    },
    saboteurEnding: {
        text: 'You escape into the ruins of the old world, leaving the dying system behind. The sky is a bruised purple, and the air is thick with the scent of real, living flowers. You are free, but you are also alone.',
        theme: 'theme-purple-sky',
        choices: []
    }
};

function startGame() {
    showStoryNode('start');
}

function showStoryNode(nodeName) {
    const node = story[nodeName];
    let text = node.text;

    // Apply visual theme
    document.body.className = node.theme || '';

    // Apply drift effects to text
    if (playerState.drift > 3) {
        text = text.replace(/a/g, 'æ').replace(/e/g, 'ë').replace(/i/g, 'ï').replace(/o/g, 'ö').replace(/u/g, 'ü');
    }
    if (playerState.drift > 5) {
        text = text.split(' ').map(word => word + (Math.random() < 0.1 ? ' [static]' : '')).join(' ');
    }

    storyElement.innerText = text;
    choicesElement.innerHTML = '';

    node.choices.forEach(choice => {
        if (!choice.condition || choice.condition(playerState)) {
            const button = document.createElement('button');
            button.innerText = choice.text;
            button.addEventListener('click', () => selectChoice(choice));
            choicesElement.appendChild(button);
        }
    });

    // Add drift-based choices
    if (playerState.drift > 7) {
        const driftChoice = document.createElement('button');
        driftChoice.innerText = '[Drift] Let the static consume you.';
        driftChoice.addEventListener('click', () => selectChoice({ next: 'consumedByStatic' }));
        choicesElement.appendChild(driftChoice);
    }
}

function selectChoice(choice) {
    // Update synergy
    if (choice.frequency) {
        if (playerState.synergy.type === choice.frequency) {
            playerState.synergy.chain++;
        } else {
            playerState.synergy.type = choice.frequency;
            playerState.synergy.chain = 1;
        }
    }

    // Update drift based on choice frequency
    switch (choice.frequency) {
        case 'Emotion':
        case 'Subterfuge':
            if (Math.random() < 0.3) { // 30% chance to increase drift
                playerState.drift++;
            }
            break;
        case 'Logic':
            if (playerState.drift > 0 && Math.random() < 0.2) { // 20% chance to decrease drift
                playerState.drift--;
            }
            break;
    }

    updateStatus();
    showStoryNode(choice.next);
}

function updateStatus() {
    synergyElement.innerText = `Cognitive Synergy: ${playerState.synergy.type} x${playerState.synergy.chain}`;
    driftElement.innerText = `Perceptual Drift: ${playerState.drift}`;
}

startGame();