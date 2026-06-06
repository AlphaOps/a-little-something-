// ==========================================
// Cozy Scrapbook Interactive Logic
// ==========================================

// Global state for envelope note auto-scrolling
let autoScrollFrame = null;
let noteScrollListener = null;
let noteInteractionListeners = null;

// Google Sheets Tracking Helper
function trackEvent(eventName) {
    fetch("https://script.google.com/macros/s/AKfycbyFD3gFJ2u2c0rNhXz5L4iz_p755VBHRzLDPyq8upCVZsMbb631ZDcde9IekenFsOuyxQ/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            action: eventName,
            time: new Date().toLocaleString(),
            page: window.location.pathname
        })
    }).catch(() => {});
}

// Global state for background music player
let audio = null;
let isMusicInitialized = false;
let isFadingIn = false;
let musicHeartInterval = null;


document.addEventListener("DOMContentLoaded", () => {
    // Floating hearts and code-generated background elements are removed as per minimal refitting instructions.
    // Init Scroll Observers
    setupScrollObservers();
});

// ==========================================
// Screen Transitions
// ==========================================
function transitionScreen(fromId, toId) {
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(toId);
    
    if (fromScreen && toScreen) {
        fromScreen.classList.add("hidden");
        fromScreen.classList.remove("active");
        toScreen.classList.remove("hidden");
        toScreen.classList.add("active");
    }
}

function acceptPromise() {
    trackEvent("Promise Accepted");
    const screen2 = document.getElementById("screen-2");
    const scrapbookStory = document.getElementById("scrapbook-story");
    
    if (screen2 && scrapbookStory) {
        screen2.classList.add("hidden");
        scrapbookStory.classList.add("active");
        
        // Enable vertical snap scroll
        document.body.style.overflow = "auto";
        document.body.style.overflowX = "hidden";
    }
}

function scrollToNextSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================================
// Page 3: Envelope Modals Note messages
// ==========================================
const noteMessages = {
    1: `<h3>🌸 First Impression</h3>
There’s something I’ve wanted to tell you for a long time.<br><br>
I know this might be a lot to take in, especially because for years we’ve mostly just been two people connected through old memories, mutual friends, and occasional conversations.<br><br>
But the truth is, even after all these years, I’ve never completely gotten over what I felt for you.<br><br>
Life moved on. We both met new people. We both experienced things that changed us. I tried to move forward too. I dated someone, and after that relationship ended, I spent a lot of time trying to understand what was missing.<br><br>
And honestly, I couldn’t explain it.<br><br>
Everything looked fine on the surface, but there was always a small part of me that felt incomplete. No matter how much time passed, I would still find myself wondering about you.<br><br>
What you were doing.<br><br>
Where life had taken you.<br><br>
Why you suddenly disappeared from social media.<br><br>
And whether you were still the same girl I met four years ago.<br><br>
Maybe it sounds silly, but one thing I’ve never forgotten is how confidently you planned our first meeting through our mutual friend all those years ago.<br><br>
For some reason, that memory never left me.<br><br>
Not because it was a grand moment.<br><br>
But because it was you.<br><br>
Over the years, whenever life got busy, whenever new people entered my life, whenever I convinced myself that I had finally moved on, somehow my thoughts always found their way back to you.<br><br>
And when I saw your story after such a long time, I realized something.<br><br>
I didn’t want to keep carrying these feelings without ever being honest about them.<br><br>
I don’t know what could have happened if things had been different.<br><br>
I don’t know what would have happened if our timing had been better.<br><br>
But I do know one thing.<br><br>
I don’t want to spend the rest of my life wondering “what if.”<br><br>
So this is me finally being honest with you.<br><br>
Years late, maybe.<br><br>
But honest.`,
    2: `<h3>☕ My Favorite Memory</h3>
Out of all the memories we share, there’s one that has somehow stayed with me more than any other.<br><br>
And the funny thing is, it probably lasted only a few seconds.<br><br>
I still remember that day when I randomly asked you about your dream destination.<br><br>
I was expecting the usual answers.<br><br>
Maybe a country.<br><br>
Maybe a city.<br><br>
Maybe some beautiful place you wanted to visit one day.<br><br>
Instead, you replied:<br><br>
“Inside your heart.”<br><br>
And then, almost immediately, you deleted it.<br><br>
You probably thought I hadn’t seen it.<br><br>
But I had.<br><br>
I saw it in my notifications before it disappeared.<br><br>
And for a moment, I just sat there staring at my screen, wondering if that had actually happened.<br><br>
Even now, years later, I still laugh thinking about it.<br><br>
Because honestly, I don’t know where you found that level of confidence.<br><br>
At that time, I don’t think I would’ve had the courage to say something like that even if I wanted to.<br><br>
But you did.<br><br>
And that’s what made it unforgettable.<br><br>
Not because it was some grand romantic gesture.<br><br>
Not because it changed everything.<br><br>
But because it was so unapologetically you.<br><br>
Maybe that’s why that tiny moment managed to survive all these years inside my memory.<br><br>
There are so many other moments I remember too.<br><br>
The conversations that somehow lasted longer than they should have.<br><br>
The evenings spent talking.<br><br>
The random walks.<br><br>
The small things that didn’t seem important at the time but somehow became important later.<br><br>
Back then, I don’t think either of us realized that one day those ordinary moments would become memories we’d carry for years.<br><br>
Life happened.<br><br>
Timing wasn’t always on our side.<br><br>
And somewhere along the way, we ended up becoming a story filled with unfinished chapters.<br><br>
But whenever I think about us, my mind always finds its way back to those simple moments.<br><br>
Because sometimes the memories that stay with us forever aren’t the biggest ones.<br><br>
They’re the smallest ones.<br><br>
The ones that made us smile when nobody was looking.<br><br>
And somehow, after all these years, that deleted message still manages to do exactly that.`
};

function openNote(id) {
    if (id === 1) trackEvent("Opened First Impression Letter");
    else if (id === 2) trackEvent("Opened Favorite Memory Letter");
    const modal = document.getElementById("note-modal");
    const content = document.getElementById("note-card-content");
    const scrollArea = document.getElementById("note-scroll-area");
    const progressBar = document.getElementById("scroll-progress");
    const hint = document.getElementById("scroll-hint");
    
    if (modal && content && noteMessages[id]) {
        // Stop any active auto-scroll
        if (autoScrollFrame) {
            cancelAnimationFrame(autoScrollFrame);
            autoScrollFrame = null;
        }
        
        content.innerHTML = noteMessages[id];
        modal.classList.add("active");
        
        // Reset scroll position and progress bar
        if (scrollArea) {
            scrollArea.scrollTop = 0;
        }
        if (progressBar) {
            progressBar.style.width = "0%";
        }
        if (hint) {
            hint.style.opacity = "0";
        }
        
        // Wait for unfold animation to finish/start
        setTimeout(() => {
            if (!scrollArea) return;
            
            const isScrollable = scrollArea.scrollHeight > scrollArea.clientHeight;
            
            // Scroll progress bar and scroll hint hide handler
            const handleScroll = () => {
                const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;
                const progress = maxScroll > 0 ? (scrollArea.scrollTop / maxScroll) * 100 : 0;
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                // Hide hint on scroll
                if (scrollArea.scrollTop > 15 && hint) {
                    hint.style.opacity = "0";
                }
            };
            
            scrollArea.addEventListener("scroll", handleScroll);
            noteScrollListener = handleScroll;
            
            // Setup Automatic Smooth Scroll for Envelope 2
            if (id === 2 && isScrollable) {
                // Show hint
                if (hint) {
                    hint.style.opacity = "1";
                }
                
                let userInteracted = false;
                
                // Handler to immediately stop auto-scroll on user interaction
                const stopAutoScroll = () => {
                    if (userInteracted) return;
                    userInteracted = true;
                    if (autoScrollFrame) {
                        cancelAnimationFrame(autoScrollFrame);
                        autoScrollFrame = null;
                    }
                    if (hint) {
                        hint.style.opacity = "0";
                    }
                    cleanupInteractionListeners();
                };
                
                const cleanupInteractionListeners = () => {
                    const events = ["wheel", "touchstart", "touchmove", "mousedown", "keydown"];
                    events.forEach(event => {
                        scrollArea.removeEventListener(event, stopAutoScroll);
                    });
                };
                
                // Attach event listeners for user control
                const events = ["wheel", "touchstart", "touchmove", "mousedown", "keydown"];
                events.forEach(event => {
                    scrollArea.addEventListener(event, stopAutoScroll, { passive: true });
                });
                
                noteInteractionListeners = { events, scrollArea, handler: stopAutoScroll };
                
                // Start smooth scrolling loop
                let currentScroll = 0;
                const scrollLoop = () => {
                    if (userInteracted) return;
                    
                    const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;
                    if (scrollArea.scrollTop < maxScroll) {
                        currentScroll += 0.35; // Slow, smooth auto-scroll speed
                        scrollArea.scrollTop = Math.floor(currentScroll);
                        autoScrollFrame = requestAnimationFrame(scrollLoop);
                    } else {
                        // Reached bottom
                        if (hint) {
                            hint.style.opacity = "0";
                        }
                        cleanupInteractionListeners();
                    }
                };
                
                // Delay auto-scroll start slightly to let paper unfold animation complete
                setTimeout(() => {
                    if (!userInteracted) {
                        currentScroll = scrollArea.scrollTop;
                        autoScrollFrame = requestAnimationFrame(scrollLoop);
                    }
                }, 1200);
            }
        }, 100);
    }
}

function closeNote() {
    const modal = document.getElementById("note-modal");
    const scrollArea = document.getElementById("note-scroll-area");
    
    if (modal) {
        modal.classList.remove("active");
    }
    
    // Stop any active auto-scroll
    if (autoScrollFrame) {
        cancelAnimationFrame(autoScrollFrame);
        autoScrollFrame = null;
    }
    
    // Clean up scroll listener
    if (scrollArea && noteScrollListener) {
        scrollArea.removeEventListener("scroll", noteScrollListener);
        noteScrollListener = null;
    }
    
    // Clean up interaction listeners
    if (noteInteractionListeners && noteInteractionListeners.events) {
        noteInteractionListeners.events.forEach(event => {
            noteInteractionListeners.scrollArea.removeEventListener(event, noteInteractionListeners.handler);
        });
        noteInteractionListeners = null;
    }
}


// ==========================================
// Scroll Observers
// ==========================================
let timelineAnimated = false;
let typewriterStarted = false;
let finalRevealStarted = false;

function setupScrollObservers() {
    const options = {
        root: null,
        threshold: 0.4
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === "section-5" && !timelineAnimated) {
                    triggerTimelineAnimation();
                } else if (entry.target.id === "section-6" && !typewriterStarted) {
                    triggerTypewriter();
                }
            }
        });
    }, options);

    document.querySelectorAll('.scrapbook-section').forEach(section => {
        observer.observe(section);
    });
}

// Timeline Animation
function triggerTimelineAnimation() {
    timelineAnimated = true;
    const progress = document.getElementById("timeline-progress-bar");
    if (progress) {
        progress.style.height = "95%";
    }

    const nodes = ["node-1", "node-2", "node-3", "node-4", "node-5"];
    nodes.forEach((nodeId, idx) => {
        setTimeout(() => {
            const node = document.getElementById(nodeId);
            if (node) {
                node.classList.add("active");
                node.classList.add("passed");
            }
        }, idx * 500);
    });
}

let typewriterText = "";
let isTypewriterSkipped = false;
let typewriterTimeout = null;
let typewriterElement = null;
let typewriterContainer = null;
let typewriterUserScrolled = false;
let typewriterAutoScrolling = false;

// Dynamic pen tip positioning logic relative to the page-6 canvas
function movePenToTarget() {
    const penTarget = document.getElementById("pen-target");
    const penCursor = document.getElementById("pen-cursor");
    const page6Canvas = document.querySelector(".scrapbook-canvas.page-6");
    const scrollCol = document.querySelector(".page6-scroll-col");
    
    if (!penTarget || !penCursor || !page6Canvas) return;
    
    const targetRect = penTarget.getBoundingClientRect();
    const canvasRect = page6Canvas.getBoundingClientRect();
    
    // Hide the pen if it crosses the burnt paper borders
    let isVisible = true;
    if (scrollCol) {
        const scrollRect = scrollCol.getBoundingClientRect();
        if (targetRect.top < scrollRect.top || targetRect.bottom > scrollRect.bottom) {
            isVisible = false;
        }
    }
    
    if (!isVisible) {
        penCursor.style.visibility = 'hidden';
        return;
    } else {
        penCursor.style.visibility = 'visible';
    }
    
    // Calculate coordinates relative to canvas
    const x = targetRect.left - canvasRect.left;
    const y = targetRect.top - canvasRect.top;
    
    // Position pen tip
    penCursor.style.left = `${x}px`;
    penCursor.style.top = `${y}px`;
}

// Window resize listener to keep pen cursor aligned if canvas layout updates
window.addEventListener('resize', () => {
    const penCursor = document.getElementById("pen-cursor");
    if (penCursor && penCursor.style.display === 'block') {
        movePenToTarget();
    }
});

// Handwriting animation function that types text and positions the pen cursor
function animateHandwriting(text, element, onComplete, slowPhrases = []) {
    const penCursor = document.getElementById("pen-cursor");
    const scrollContainer = document.querySelector(".page6-scroll-col");
    isTypewriterSkipped = false;
    
    // Compute character ranges for slow phrases dynamically
    const slowRanges = [];
    slowPhrases.forEach(phrase => {
        let pos = text.indexOf(phrase);
        while (pos !== -1) {
            slowRanges.push({ start: pos, end: pos + phrase.length });
            pos = text.indexOf(phrase, pos + 1);
        }
    });

    // Remove any existing pen-targets to prevent duplicates
    document.querySelectorAll('#pen-target').forEach(el => el.removeAttribute('id'));

    element.innerHTML = `<span></span><span id="pen-target" style="display: inline-block; width: 0; height: 0; overflow: hidden; vertical-align: middle;"></span>`;
    const textContainer = element.querySelector("span");
    
    if (penCursor) {
        penCursor.style.display = "block";
        penCursor.classList.add("writing");
    }
    
    let index = 0;
    typewriterUserScrolled = false;
    typewriterAutoScrolling = false;
    
    const onScroll = () => {
        if (!typewriterAutoScrolling) typewriterUserScrolled = true;
        movePenToTarget();
    };
    
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', onScroll);
        scrollContainer.addEventListener('wheel', onScroll);
        scrollContainer.addEventListener('touchstart', onScroll);
    }
    
    function writeNext() {
        if (isTypewriterSkipped) {
            if (penCursor) {
                penCursor.classList.remove("writing");
                penCursor.style.display = "none";
            }
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', onScroll);
                scrollContainer.removeEventListener('wheel', onScroll);
                scrollContainer.removeEventListener('touchstart', onScroll);
            }
            return;
        }
        
        if (index < text.length) {
            const char = text.charAt(index);
            textContainer.textContent += char;
            
            // Auto scroll container
            if (!typewriterUserScrolled && scrollContainer) {
                typewriterAutoScrolling = true;
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                setTimeout(() => { typewriterAutoScrolling = false; }, 50);
            }

            // Move pen cursor
            movePenToTarget();
            
            // Calculate delay
            let delay = 35; // base handwriting writing speed
            
            const isSlow = slowRanges.some(r => index >= r.start && index < r.end);
            if (isSlow) {
                delay = 80;
            }
            
            const prevChar = text.charAt(index);
            const nextChar = text.charAt(index + 1);
            if (prevChar === '\n' && nextChar === '\n') {
                delay = 700;
            } else if (prevChar === '.' || prevChar === '?') {
                delay = 450;
            } else if (prevChar === ',') {
                delay = 250;
            }
            
            index++;
            typewriterTimeout = setTimeout(writeNext, delay);
        } else {
            // Finished writing this block
            if (penCursor) {
                penCursor.classList.remove("writing");
            }
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', onScroll);
                scrollContainer.removeEventListener('wheel', onScroll);
                scrollContainer.removeEventListener('touchstart', onScroll);
            }
            
            // Remove the pen-target element when done so it doesn't affect kerning or copy-paste
            const penTarget = document.getElementById("pen-target");
            if (penTarget) penTarget.remove();
            
            if (onComplete) onComplete();
        }
    }
    
    writeNext();
}

// Global Skip Function
window.skipTypewriter = function() {
    if (isTypewriterSkipped) return;
    isTypewriterSkipped = true;
    
    // Clear any active typewriter timeout
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
    }
    
    const titleElement = document.getElementById("letter-title-text");
    const bodyElement = document.getElementById("typewriter-text");
    const penCursor = document.getElementById("pen-cursor");
    
    if (titleElement) {
        titleElement.textContent = "Dear Ankita,";
    }
    if (bodyElement) {
        bodyElement.textContent = typewriterText;
    }
    if (penCursor) {
        penCursor.style.display = "none";
        penCursor.classList.remove("writing");
    }
    
    // Hide the skip button
    const skipBtn = document.getElementById("skip-letter-btn");
    if (skipBtn) {
        skipBtn.classList.add("hidden");
    }
    
    // Show the continue button
    const continueBtn = document.getElementById("continue-letter-btn");
    if (continueBtn) {
        continueBtn.classList.remove("hidden");
    }
    
    // Scroll container to bottom
    const scrollContainer = document.querySelector(".page6-scroll-col");
    if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
};

// Typewriter script on Page 6
function triggerTypewriter() {
    typewriterStarted = true;
    const titleElement = document.getElementById("letter-title-text");
    const bodyElement = document.getElementById("typewriter-text");
    const penCursor = document.getElementById("pen-cursor");
    isTypewriterSkipped = false;
    
    const skipBtn = document.getElementById("skip-letter-btn");
    if (skipBtn) {
        skipBtn.classList.remove("hidden");
    }
    
    typewriterText = `I know this is probably a lot to take in, and I'm not expecting an answer right away.

I just felt that after all these years, I owed it to myself to finally be honest with you.

The truth is, I think I've been waiting for the "perfect moment" to say all of this.

At first, I thought maybe time would make these feelings disappear.

Then I thought maybe life would move on and I'd eventually forget.

Then months turned into years.

And somehow, here I am.

Four years later.

Still writing this.

Still thinking that some things were never fully said.

Maybe nothing changes after this.

Maybe everything does.

Honestly, I don't know.

But what I do know is that I don't want to look back years from now and still be asking myself,
"What if?"

For the longest time, I kept telling myself,
"Maybe this isn't the right time."

But eventually I realized there probably isn't a perfect time for something like this.

There's only honesty.

And this is mine.

No matter what your answer is, I'll respect it completely.

I don't want you to feel pressured, rushed, or responsible for my feelings.

I just wanted you to know them.

Because after all this time, after everything life has thrown our way, a part of me still finds its way back to you.

And if there is even the smallest part of you that has ever wondered "what if" too...
I'd love to explore that possibility together.

Not because of who we were four years ago.
But because of who we are now.

Maybe we're meant to stay as a beautiful memory.
Or maybe we're finally meeting at the right chapter of our lives.

I don't know.
But I think after four years, it's a question worth finding out.

Love,
Aayush`;

    // Define target phrases for slower writing speed (emotional emphasis)
    const slowPhrases = [
        "\"What if?\"",
        "There's only honesty.",
        "And this is mine.",
        "Maybe we're finally meeting at the right chapter of our lives."
    ];

    // Write title first
    animateHandwriting("Dear Ankita,", titleElement, () => {
        // Wait 800ms after writing "Dear Ankita,", then write the body text
        setTimeout(() => {
            if (isTypewriterSkipped) return;
            
            animateHandwriting(typewriterText, bodyElement, () => {
                // Completed the entire letter! Hide pen cursor and skip button, show continue button
                if (penCursor) penCursor.style.display = "none";
                
                const skipBtn = document.getElementById("skip-letter-btn");
                if (skipBtn) {
                    skipBtn.classList.add("hidden");
                }
                
                const continueBtn = document.getElementById("continue-letter-btn");
                if (continueBtn) {
                    continueBtn.classList.remove("hidden");
                }
                
                // Scroll to bottom
                const scrollContainer = document.querySelector(".page6-scroll-col");
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }
            }, slowPhrases);
        }, 800);
    });
}

function transitionLetterToConfession() {
    const letterPage = document.getElementById("letter-page-wrapper");
    const confessionBox = document.getElementById("confession-box");
    
    if (letterPage && confessionBox) {
        // Fade out letter
        letterPage.style.transition = "opacity 1s ease";
        letterPage.style.opacity = "0";
        
        setTimeout(() => {
            letterPage.style.display = "none";
            confessionBox.classList.add("active");
            triggerFinalReveal();
        }, 1000);
    }
}

// Final Confession Handwriting animation
function triggerFinalReveal() {
    trackEvent("Reached Final Confession Section");
    finalRevealStarted = true;
    const element = document.getElementById("confession-typewriter-text");
    const penCursor = document.getElementById("pen-cursor");

    const confessionText = `And if there's even a small part of you that's willing…

I'd like to ask you something.

Let's start from the beginning.

Not from the misunderstandings.

Not from the timing issues.

Not from who we were four years ago.

But from who we are today.

The first time, you planned the meeting.

This time, let me plan it.

No pressure.

No expectations.

Just one coffee.

One conversation.

And one honest chance to see where this goes.`;

    const slowPhrases = [
        "This time, let me plan it.",
        "And one honest chance to see where this goes."
    ];

    animateHandwriting(confessionText, element, () => {
        // Confession completed writing! Hide pen cursor and reveal final buttons
        if (penCursor) penCursor.style.display = "none";
        
        setTimeout(() => {
            const btnContainer = document.getElementById("final-btn-container");
            if (btnContainer) {
                btnContainer.classList.add("visible");
                const scrollContainer = document.querySelector(".page6-scroll-col");
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }
            }
        }, 1000);
    }, slowPhrases);
}

// Date buttons row click handlers
window.clickLetsMeet = function() {
    trackEvent("Clicked Let's Meet");
    // Hide buttons row
    const btnRow = document.querySelector(".final-buttons-row");
    if (btnRow) {
        btnRow.style.display = "none";
    }
    // Show Let's Meet banner
    const banner = document.getElementById("lets-meet-banner");
    if (banner) {
        banner.classList.remove("hidden");
    }
    // Celebrate with floating hearts
    celebrateHearts();
    // Scroll container to bottom
    const container = document.querySelector(".page6-scroll-col");
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
};

window.clickNeedTime = function() {
    trackEvent("Clicked I Need More Time");
    // Hide buttons row
    const btnRow = document.querySelector(".final-buttons-row");
    if (btnRow) {
        btnRow.style.display = "none";
    }
    // Show Need Time banner
    const banner = document.getElementById("need-time-banner");
    if (banner) {
        banner.classList.remove("hidden");
    }
    // Celebrate with floating hearts
    celebrateHearts();
    // Scroll container to bottom
    const container = document.querySelector(".page6-scroll-col");
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
};

// Date banner success trigger
function showDateSuccess() {
    const banner = document.getElementById("date-success-banner");
    if (banner) {
        banner.style.display = "block";
        celebrateHearts();
    }
}

function celebrateHearts() {
    // Empty to remove floating hearts/sparkles decorations as requested
}

// ==========================================
// BACKGROUND MUSIC PLAYER SYSTEM
// ==========================================

window.startExperience = function() {
    trackEvent("Website Opened");
    const overlay = document.getElementById("music-start-overlay");
    if (overlay) {
        overlay.classList.add("fade-out");
        setTimeout(() => {
            overlay.remove();
        }, 800);
    }
    
    if (!isMusicInitialized) {
        initBackgroundMusic();
    }
};

function initBackgroundMusic() {
    if (isMusicInitialized) return;
    isMusicInitialized = true;

    audio = new Audio("/assets/music/song.mp3");
    
    // Fallback path handler
    audio.addEventListener('error', (e) => {
        console.error('Audio failed to load', e);
        if (audio.src.includes('/assets/music/song.mp3')) {
            console.warn("Primary path failed. Retrying secondary path public/assets/music/song.mp3...");
            audio.src = 'public/assets/music/song.mp3';
            audio.load();
        } else {
            handleAudioError();
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        console.log('Metadata loaded');
        if (audio.currentTime < 20) {
            audio.currentTime = 20;
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.currentTime < 20 && !audio.seeking) {
            audio.currentTime = 20;
        }
    });

    audio.addEventListener('ended', () => {
        audio.currentTime = 20;
        audio.play().catch(err => {
            console.error("Failed to replay audio on ended event:", err);
        });
    });

    audio.addEventListener('play', () => {
        updatePlayPauseUI(true);
        startHeartParticles();
    });

    audio.addEventListener('pause', () => {
        updatePlayPauseUI(false);
        stopHeartParticles();
    });

    // Start playback with 2-second volume fade-in
    audio.volume = 0;
    audio.muted = false;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Fade in volume over 2 seconds
            let start = null;
            const duration = 2000;
            const targetVolume = 0.8; // Comfortable volume level (80%)
            isFadingIn = true;
            
            function step(timestamp) {
                if (!isFadingIn) return;
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const currentVol = Math.min((progress / duration) * targetVolume, targetVolume);
                
                if (audio) {
                    audio.volume = currentVol;
                }
                
                if (progress < duration && isFadingIn) {
                    window.requestAnimationFrame(step);
                } else {
                    if (audio) {
                        audio.volume = targetVolume;
                    }
                    isFadingIn = false;
                }
            }
            window.requestAnimationFrame(step);
        }).catch(err => {
            console.warn("Playback blocked by browser or file missing:", err);
            handleAudioError();
        });
    }
}

function handleAudioError() {
    const content = document.getElementById("music-player-content");
    const fallback = document.getElementById("music-player-fallback");
    if (content && fallback) {
        content.classList.add("hidden");
        fallback.classList.remove("hidden");
    }
    stopHeartParticles();
}

window.togglePlayPause = function() {
    if (!audio) return;
    
    if (audio.paused) {
        audio.play().catch(err => {
            console.error("Playback failed on togglePlayPause:", err);
            handleAudioError();
        });
    } else {
        audio.pause();
    }
};

function updatePlayPauseUI(isPlaying) {
    const playIcon = document.getElementById("music-play-icon");
    const indicator = document.getElementById("music-indicator");
    const playBtn = document.getElementById("music-play-btn");
    
    if (playIcon) {
        playIcon.textContent = isPlaying ? "⏸" : "▶";
    }
    
    if (playBtn) {
        if (isPlaying) {
            playBtn.classList.add("playing");
        } else {
            playBtn.classList.remove("playing");
        }
    }
    
    if (indicator) {
        if (isPlaying) {
            indicator.classList.add("spinning");
        } else {
            indicator.classList.remove("spinning");
        }
    }
}

window.changeVolume = function(val) {
    if (audio) {
        audio.volume = parseFloat(val);
    }
};

// Subtle, non-distracting music heart particles
function startHeartParticles() {
    // Empty to remove floating hearts/emoji/sparkles decorations
}

function stopHeartParticles() {
    // Empty to remove floating hearts/emoji/sparkles decorations
}

function createSubtleMusicHeart() {
    // Empty to remove floating hearts/emoji/sparkles decorations
}
