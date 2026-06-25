document.addEventListener("DOMContentLoaded", () => {
    const state = {
        currentSectionIndex: 0,
        name: "राजवी",
        introTyped: false,
        storyTyped: false,
        activeSlide: 0,
        letterOpened: false,
        galleryExpanded: false,
        quizCurrentQuestion: 0,
        quizScore: 0,
        folderOpened: false,
        musicPlaying: false
    };

    const bgMusic = document.getElementById("bg-music");
    const musicToggle = document.getElementById("music-toggle");
    const navBack = document.getElementById("nav-back");
    const stepNav = document.getElementById("step-nav");
    const stepToggle = document.getElementById("step-toggle");
    const stepButtons = stepNav ? stepNav.querySelectorAll(".step-btn") : [];
    const particleCanvas = document.getElementById("particle-canvas");

    const sections = [
        document.getElementById("section-intro"),
        document.getElementById("section-story"),
        document.getElementById("section-gallery"),
        document.getElementById("section-puzzle"),
        document.getElementById("section-letter"),
        document.getElementById("section-quiz"),
        document.getElementById("section-folder"),
        document.getElementById("section-finale")
    ];

    const introName = document.getElementById("typewriter-name");

    const storyText = document.getElementById("story-text");
    const storyContinueBtn = document.getElementById("story-continue-btn");
    const storyContainer = document.querySelector(".story-scroll-container");

    const galleryContainer = document.querySelector(".gallery-container");
    const galleryWrapper = document.querySelector(".gallery-wrapper");
    const gallerySlides = document.querySelectorAll(".gallery-slide");
    const galleryDots = document.querySelectorAll(".dot");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const galleryContinueBtn = document.getElementById("gallery-continue-btn");

    const envelopeWrapper = document.querySelector(".envelope-wrapper");
    const letterContinueBtn = document.getElementById("letter-continue-btn");
    const envelopeTip = document.getElementById("envelope-tip");

    const quizQuestionText = document.getElementById("quiz-question");
    const quizOptionsContainer = document.getElementById("quiz-options");
    const quizFeedback = document.getElementById("quiz-feedback");
    const quizQuestionNum = document.getElementById("question-number");
    const progressBarFill = document.getElementById("progress-bar-fill");
    const quizContainer = document.querySelector(".quiz-container");
    const quizBox = document.getElementById("quiz-box");
    const quizSuccessMsg = document.getElementById("quiz-success-message");
    const quizContinueBtn = document.getElementById("quiz-continue-btn");
    const celebrateCanvas = document.getElementById("celebrate-canvas");

    const crushFolder = document.getElementById("crush-folder");
    const folderCards = document.getElementById("folder-cards");
    const folderSub = document.getElementById("folder-sub");
    const folderContinueWrap = document.getElementById("folder-continue-wrap");
    const folderContinueBtn = document.getElementById("folder-continue-btn");

    const pCtx = particleCanvas.getContext("2d");
    let particles = [];

    function resizeParticleCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeParticleCanvas);
    resizeParticleCanvas();

    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * particleCanvas.height;
        }

        reset() {
            this.x = Math.random() * particleCanvas.width;
            this.y = particleCanvas.height + 20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 0.8 + 0.3;
            this.speedX = Math.sin(Math.random() * 2) * 0.3;
            this.alpha = Math.random() * 0.5 + 0.2;
            this.isHeart = Math.random() > 0.4;
            this.angle = Math.random() * Math.PI;
            this.spinSpeed = Math.random() * 0.02 - 0.01;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.angle += this.spinSpeed;
            if (this.y < -20 || this.x < -20 || this.x > particleCanvas.width + 20) {
                this.reset();
            }
        }

        draw() {
            pCtx.save();
            pCtx.globalAlpha = this.alpha;
            pCtx.translate(this.x, this.y);
            pCtx.rotate(this.angle);

            if (this.isHeart) {
                pCtx.fillStyle = "#FF4F8B";

                pCtx.beginPath();
                const d = this.size;
                pCtx.moveTo(0, d / 4);
                pCtx.quadraticCurveTo(0, 0, d / 2, 0);
                pCtx.quadraticCurveTo(d, 0, d, d / 4);
                pCtx.quadraticCurveTo(d, d / 2, d / 2, d * 0.75);
                pCtx.quadraticCurveTo(0, d / 2, 0, d / 4);
                pCtx.closePath();
                pCtx.fill();
            } else {
                pCtx.fillStyle = "#FFD166";
                pCtx.shadowBlur = 8;
                pCtx.shadowColor = "#FFD166";
                pCtx.beginPath();
                pCtx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
                pCtx.fill();
            }
            pCtx.restore();
        }
    }

    for (let i = 0; i < 45; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    function toggleMusic() {
        if (state.musicPlaying) {
            bgMusic.pause();
            musicToggle.classList.add("muted");
            state.musicPlaying = false;
        } else {
            bgMusic.play().catch(e => console.log("Audio play blocked by user gesture setting."));
            musicToggle.classList.remove("muted");
            state.musicPlaying = true;
        }
    }
    musicToggle.addEventListener("click", toggleMusic);

    function startMusic() {
        if (!state.musicPlaying) {
            bgMusic.play()
                .then(() => {
                    state.musicPlaying = true;
                    musicToggle.classList.remove("muted");
                    musicToggle.classList.remove("hidden");
                })
                .catch(err => {
                    console.log("Audio play failed, showing audio button muted", err);
                    musicToggle.classList.add("muted");
                    musicToggle.classList.remove("hidden");
                });
        }
    }

    bgMusic.volume = 0.5;
    bgMusic.play()
        .then(() => {
            state.musicPlaying = true;
            musicToggle.classList.remove("muted", "hidden");
        })
        .catch(() => {
            const beginMusic = () => startMusic();
            document.addEventListener("pointerdown", beginMusic, { once: true });
            document.addEventListener("keydown", beginMusic, { once: true });
            document.addEventListener("touchstart", beginMusic, { once: true });
        });

    function showSection(index) {
        sections.forEach((sec, idx) => {
            if (idx === index) {
                sec.classList.remove("hidden");

                setTimeout(() => sec.classList.add("active"), 50);
            } else {
                sec.classList.remove("active");
                sec.classList.add("hidden");
            }
        });
        state.currentSectionIndex = index;

        if (navBack) navBack.classList.toggle("hidden", index < 2);

        if (stepNav) {
            stepNav.classList.toggle("hidden", index < 1);
            stepButtons.forEach((btn) => {
                btn.classList.toggle("active", Number(btn.dataset.step) === index);
            });
        }

        if (index === 1 && !state.storyTyped) {
            triggerStoryTypewriter();
        } else if (index === 2) {
            resetGalleryView();
        } else if (index === 3) {
            initPuzzle();
        } else if (index === 5) {
            initQuiz();
        } else if (index === 6) {
            initCrushFolder();
        }
    }

    const introGreeting = document.querySelector(".intro-greeting");

    function splitGraphemes(text) {
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
            const seg = new Intl.Segmenter("mr", { granularity: "grapheme" });
            return Array.from(seg.segment(text), (s) => s.segment);
        }
        return Array.from(text);
    }

    function typeInto(el, text, onDone) {
        const chars = splitGraphemes(text);
        let index = 0;
        el.innerHTML = "";

        function typeChar() {
            if (index < chars.length) {
                const span = document.createElement("span");
                span.className = "char";

                span.innerHTML = chars[index] === " " ? "&nbsp;" : chars[index];
                el.appendChild(span);

                requestAnimationFrame(() => span.classList.add("visible"));
                index++;
                setTimeout(typeChar, 160);
            } else if (onDone) {
                onDone();
            }
        }

        typeChar();
    }

    function triggerIntroTypewriter() {
        if (introGreeting) introGreeting.innerHTML = "";
        introName.innerHTML = "";

        setTimeout(() => {
            typeInto(introGreeting, "Hey", () => {
                setTimeout(() => {
                    typeInto(introName, state.name, () => {
                        state.introTyped = true;
                    });
                }, 400);
            });
        }, 700);
    }
    triggerIntroTypewriter();

    document.querySelector(".intro-content").addEventListener("click", () => {
        if (!state.introTyped) return;

        introName.classList.add("glow");
        if (introGreeting) introGreeting.style.opacity = 0;

        startMusic();

        setTimeout(() => {
            introName.classList.add("netflix-zoom");

            const flash = document.createElement("div");
            flash.classList.add("flash-overlay");
            document.body.appendChild(flash);

            setTimeout(() => {
                flash.classList.add("active");
            }, 800);

            setTimeout(() => {
                showSection(1);

                setTimeout(() => {
                    flash.classList.remove("active");
                    setTimeout(() => flash.remove(), 500);
                }, 400);
            }, 1800);
        }, 800);
    });

    function triggerStoryTypewriter() {
        state.storyTyped = true;
        const storyHtml = `Log vichartat aapan kase bhetlo, me mhanto online — ek simple arranged intro, do strangers ani ek biodata. Pan ti tar fakt mazi half story ahe. Khari goshti tar ti ahe — <span class="glow-pink">Rajvi</span>.

Karan Rajvi la garaj navhti mazya sarkhya manasashi itka patience thevaychi — me overthinker, shabd naslela, ghabarnara — pan ti thambli. Pahilya chats pasunach ti ashi aaikaychi jashi aajparyant koni nahi. Shant. Judge na karta. <span class="glow-purple">"Mi judge nahi karat,"</span> ti mhanaychi — ani pratyek veles te khara asaycha. Tine tichya aayushyatlya saglyat hard goshti share kelya — premature janma, Covid che divas je ti javaljaval ekti survive keli, shunyatun ubha kelela business — ani te sagla titkya shant taakdine sangitle ki me baghtach rahilo.

Jevha aapan finally bhetlo, dhadsi tich hoti. Pahilyanda bike var, nervous, tarihi ti aali. Mazi pratyek choti gosht tine notice keli ani lakshat thevli — ani tya raatri tine ek <span class="glow-pink">numbered list</span> lihili, ek-ek detail. Asa kon karta? Fakt ti.

"Us" madhla pratyek changla kshan tichya mule ahe — ticha shantpana jo maza gondhal sathavto, tichi <span class="glow-pink">kindness</span>, tichi <span class="glow-gold">honesty</span>, kontihi guarantee nastana suddha ti jashi kalji ghete, ani ti mhante ki kahihi zala tari ti mala kadhich blame nahi karnar. Tine ek formality la feeling banavli. Tine mala asa manus banavla jo trust karu shakto.

So jevha me mhanto <span class="glow-pink">"tu mala complete kartes"</span> ani <span class="glow-pink">"tu maza home ahes,"</span> — me us baddal bolat nahiye. Me tichya baddal boltoy. Aata aapan fakt wait kartoy — family var, ek ho var — pan mala aata mahit ahe: mazya aayushyatli saglyat changli goshti mhanje <span class="glow-pink">Rajvi</span>. <span class="glow-gold">Forever, yedu.</span> 🐣🌝🤍`;

        storyContinueBtn.classList.add("hidden");

        let html = "";
        let idx = 0;
        while (idx < storyHtml.length) {
            if (storyHtml[idx] === "<") {
                const end = storyHtml.indexOf(">", idx);
                html += storyHtml.substring(idx, end + 1);
                idx = end + 1;
            } else {
                let next = storyHtml.indexOf("<", idx);
                if (next === -1) next = storyHtml.length;
                splitGraphemes(storyHtml.substring(idx, next)).forEach((g) => {
                    if (g === "\n") html += "<br>";
                    else if (g === " ") html += '<span class="char"> </span>';
                    else html += '<span class="char">' + g + "</span>";
                });
                idx = next;
            }
        }
        storyText.innerHTML = html;

        const chars = storyText.querySelectorAll(".char");
        let i = 0;
        function writeStory() {
            if (i < chars.length) {
                const ch = chars[i];
                ch.classList.add("visible");
                i++;

                const cRect = storyContainer.getBoundingClientRect();
                const chRect = ch.getBoundingClientRect();
                if (chRect.bottom > cRect.bottom - 24) {
                    storyContainer.scrollTop += (chRect.bottom - cRect.bottom) + 48;
                }
                setTimeout(writeStory, 18);
            } else {
                storyContinueBtn.classList.remove("hidden");
            }
        }

        setTimeout(writeStory, 700);
    }

    storyContinueBtn.addEventListener("click", () => {
        showSection(2);
    });

    function updateGallery() {
        gallerySlides.forEach((slide, idx) => {
            slide.classList.remove("active");
            galleryDots[idx].classList.remove("active");
            if (idx === state.activeSlide) {
                slide.classList.add("active");
                galleryDots[idx].classList.add("active");
            }
        });
    }

    const galleryBlastPhotos = [
        { src: "assets/galary/b3.jpg",  cap: "Your birthday glow 🎂" },
        { src: "assets/galary/b15.jpg", cap: "Simple, so stunning 💙" },
        { src: "assets/galary/b14.jpg", cap: "Our little heart 🤍" },
        { src: "assets/galary/b4.jpg",  cap: "Boss-lady glow 😎" },
        { src: "assets/galary/b11.jpg", cap: "Because you're art ✏️" },
        { src: "assets/galary/b10.jpg", cap: "Reaching for dreams 🌙" },
        { src: "assets/galary/b1.jpg",  cap: "Dressed in colours 🌸" },
        { src: "assets/galary/b2.jpg",  cap: "Golden grace 💛" },
        { src: "assets/galary/b5.jpg",  cap: "Cozy soul 🤍" },
        { src: "assets/galary/b6.jpg",  cap: "A quiet moment ☁️" },
        { src: "assets/galary/b7.jpg",  cap: "Tiny you 🐣" },
        { src: "assets/galary/b8.jpg",  cap: "Little angel 👶" },
        { src: "assets/galary/b9.jpg",  cap: "That smile ✨" },
        { src: "assets/galary/b12.jpg", cap: "Our kind of view 🌴" },
        { src: "assets/galary/b13.jpg", cap: "Bold & beautiful ❤️" },
        { src: "assets/galary/b16.jpg", cap: "Golden hour 🌅" }
    ];

    function attachScatterDrag(slide) {
        let dragging = false, sx = 0, sy = 0, startL = 0, startT = 0;
        slide.addEventListener("pointerdown", (e) => {
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            startL = parseFloat(slide.style.left) || 0;
            startT = parseFloat(slide.style.top) || 0;
            slide.setPointerCapture(e.pointerId);
            slide.classList.add("grabbing");
            slide.style.zIndex = "9999";
            e.preventDefault();
        });
        slide.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            slide.style.left = `${startL + (e.clientX - sx)}px`;
            slide.style.top = `${startT + (e.clientY - sy)}px`;
        });
        const end = () => {
            if (!dragging) return;
            dragging = false;
            slide.classList.remove("grabbing");
        };
        slide.addEventListener("pointerup", end);
        slide.addEventListener("pointercancel", end);
    }

    function buildScatterCards() {
        galleryWrapper.querySelectorAll(".scatter-card").forEach((c) => c.remove());
        galleryBlastPhotos.forEach((p) => {
            const card = document.createElement("div");
            card.className = "gallery-slide scatter-card";
            card.innerHTML =
                '<div class="slide-card glass-card">' +
                `<img src="${p.src}" class="slide-img" alt="">` +
                `<div class="slide-info"><h3 class="slide-caption">${p.cap}</h3></div>` +
                "</div>";
            attachScatterDrag(card);
            galleryWrapper.appendChild(card);
        });
    }

    function positionScatter() {
        const cards = galleryWrapper.querySelectorAll(".scatter-card");
        const vw = window.innerWidth, vh = window.innerHeight;
        const cardW = vw < 600 ? 150 : 200;
        const cardH = vw < 600 ? 170 : 230;
        const minX = 10, maxX = Math.max(minX + 1, vw - cardW - 10);
        const minY = 56, maxY = Math.max(minY + 1, vh - cardH - 84);

        cards.forEach((slide, i) => {
            const x = minX + Math.random() * (maxX - minX);
            const y = minY + Math.random() * (maxY - minY);
            const rot = (Math.random() * 2 - 1) * 14;
            slide.style.left = `${Math.round(x)}px`;
            slide.style.top = `${Math.round(y)}px`;
            slide.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
            slide.style.zIndex = String(20 + i);
            setTimeout(() => slide.classList.add("pop"), i * 70);
        });
    }

    function scatterGallery() {
        state.galleryExpanded = true;

        galleryWrapper.classList.add("collapsing");
        setTimeout(() => {
            galleryWrapper.classList.remove("collapsing");
            galleryContainer.classList.add("scattered");
            buildScatterCards();
            positionScatter();
        }, 220);
    }

    function resetGalleryView() {
        state.galleryExpanded = false;
        galleryContainer.classList.remove("scattered");
        galleryWrapper.classList.remove("collapsing");
        galleryWrapper.querySelectorAll(".scatter-card").forEach((c) => c.remove());
        state.activeSlide = 0;
        updateGallery();
    }

    nextBtn.addEventListener("click", () => {
        if (state.activeSlide === gallerySlides.length - 1) {
            scatterGallery();
            return;
        }
        state.activeSlide += 1;
        updateGallery();
    });

    prevBtn.addEventListener("click", () => {
        if (state.galleryExpanded) {
            resetGalleryView();
            state.activeSlide = gallerySlides.length - 1;
            updateGallery();
            return;
        }
        state.activeSlide = (state.activeSlide - 1 + gallerySlides.length) % gallerySlides.length;
        updateGallery();
    });

    galleryDots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            state.activeSlide = idx;
            updateGallery();
        });
    });

    galleryContinueBtn.addEventListener("click", () => {
        showSection(3);
    });

    const letterPaper = document.querySelector(".letter-paper");

    function closeLetter() {
        if (!state.letterOpened) return;
        envelopeWrapper.classList.remove("open");
        state.letterOpened = false;
        letterContinueBtn.classList.add("hidden");
        envelopeTip.style.opacity = 1;
        document.removeEventListener("click", outsideLetterClick);
    }

    function outsideLetterClick(e) {
        if (letterPaper.contains(e.target)) return;
        if (letterContinueBtn.contains(e.target)) return;
        closeLetter();
    }

    envelopeWrapper.addEventListener("click", () => {
        if (state.letterOpened) return;

        envelopeWrapper.classList.add("open");
        state.letterOpened = true;
        envelopeTip.style.opacity = 0;

        setTimeout(() => {
            letterContinueBtn.classList.remove("hidden");
        }, 1500);

        setTimeout(() => document.addEventListener("click", outsideLetterClick), 60);
    });

    letterContinueBtn.addEventListener("click", () => {
        closeLetter();
        showSection(5);
    });

    const quizQuestions = [
        {
            question: "Where did we first start talking? 😉",
            options: ["In a cozy café ☕", "Online — an arranged intro that turned into something real 📱", "At a friend's party 🎉", "A street coincidence ✨"],
            answer: 1,
            feedback: "Yes! An arranged intro online that quietly turned into my whole world. ❤️"
        },
        {
            question: "What words did Shubham use to describe what Rajvi means to him? 💬",
            options: ["\"My best friend\"", "\"You complete me — you're the home I was looking for\" 🏡", "\"My lucky charm\"", "\"My peace\""],
            answer: 1,
            feedback: "Exactly — you complete me, you're the home I was always looking for. 🏡"
        },
        {
            question: "On the bike (and again while sitting), what did we both secretly want to do but were too shy to? 🙈",
            options: ["Take a selfie", "Say \"I love you\"", "Hold each other's hand 🤍", "Hug"],
            answer: 2,
            feedback: "Hold hands 🤍 — both too shy, both wishing for the very same thing."
        },
        {
            question: "What did we both do right after our first meeting that mirrored each other perfectly? 📝",
            options: ["Called our families", "Wrote a numbered list of every little thing we'd noticed about the other 📝", "Posted on Instagram", "Texted \"good night\" together"],
            answer: 1,
            feedback: "We both made a numbered list about each other — same hearts, same minds. 💞"
        },
        {
            question: "What's our go-to way of being close? 📞",
            options: ["Long walks 🚶", "Late-night phone calls — sometimes till 3 am 📞", "Movie dates 🎬", "Trying new restaurants 🍕"],
            answer: 1,
            feedback: "Late-night calls till 3 am 📞 — I'd lose sleep for your voice any day."
        },
        {
            question: "Which anime character did Shubham put on Rajvi's custom ID card design? ⚡",
            options: ["Naruto", "Tanjiro", "Zenitsu ⚡", "Goku"],
            answer: 2,
            feedback: "Zenitsu ⚡ — obviously. 🐣"
        },
        {
            question: "What did Shubham secretly start doing just to catch a glimpse of Rajvi? 🏍️",
            options: ["Messaging every morning", "Driving slowly past her office, even changing his timing 🏍️", "Asking her friends", "Following her online"],
            answer: 1,
            feedback: "Guilty 🏍️ — I changed my whole timing just for one glimpse of you."
        },
        {
            question: "Which two emojis are Rajvi's all-time favourites? 🐣",
            options: ["😍 and 🥰", "🐣 and 🌝", "🍫 and 🤍", "😂 and 🙆‍♀️"],
            answer: 1,
            feedback: "🐣 and 🌝 — the cutest little combo, just like you."
        },
        {
            question: "What's Rajvi's affectionate nickname for Shubham? 🥰",
            options: ["Babu", "Yedu 🐣", "Shubh", "Jaan"],
            answer: 1,
            feedback: "Yedu 🐣 — my favourite thing to be called."
        },
        {
            question: "How long does Shubham want to be with Rajvi? ⏳",
            options: ["For this year 📅", "A few more years 🗓️", "Forever, and a little more ♾️", "Until the last star fades 🌟"],
            answer: 2,
            feedback: "Forever, and a little more ♾️ — you're my today and all my tomorrows."
        }
    ];

    function initQuiz() {
        state.quizCurrentQuestion = 0;
        state.quizScore = 0;
        quizContainer.classList.remove("exiting", "hidden");
        quizBox.classList.remove("hidden");
        quizSuccessMsg.classList.add("hidden");
        loadQuizQuestion();
    }

    function loadQuizQuestion() {
        const q = quizQuestions[state.quizCurrentQuestion];
        quizQuestionNum.textContent = `Question ${state.quizCurrentQuestion + 1} of ${quizQuestions.length}`;

        const progressPercent = ((state.quizCurrentQuestion + 1) / quizQuestions.length) * 100;
        progressBarFill.style.width = `${progressPercent}%`;

        quizQuestionText.textContent = q.question;
        quizOptionsContainer.innerHTML = "";
        quizFeedback.textContent = "";
        quizFeedback.style.opacity = 0;

        q.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.classList.add("option-btn");
            btn.textContent = opt;
            btn.addEventListener("click", () => handleQuizAnswer(idx, btn));
            quizOptionsContainer.appendChild(btn);
        });
    }

    function handleQuizAnswer(selectedIdx, btnElement) {
        const q = quizQuestions[state.quizCurrentQuestion];
        const buttons = quizOptionsContainer.querySelectorAll(".option-btn");

        buttons.forEach(btn => btn.disabled = true);

        if (selectedIdx === q.answer) {
            btnElement.classList.add("correct");
            quizFeedback.textContent = q.feedback;
            quizFeedback.style.color = "#10b981";
            quizFeedback.style.opacity = 1;

            setTimeout(() => {
                state.quizCurrentQuestion++;
                if (state.quizCurrentQuestion < quizQuestions.length) {
                    loadQuizQuestion();
                } else {
                    showQuizSuccess();
                }
            }, 2500);
        } else {
            btnElement.classList.add("wrong");
            quizFeedback.textContent = "Oops! Try again, my love! Click another option 💕";
            quizFeedback.style.color = "#ef4444";
            quizFeedback.style.opacity = 1;

            setTimeout(() => {
                buttons.forEach(btn => {
                    if (!btn.classList.contains("wrong")) {
                        btn.disabled = false;
                    }
                });
                quizFeedback.style.opacity = 0;
            }, 1500);
        }
    }

    function runFireworks(duration) {
        if (!celebrateCanvas) return;
        const ctx = celebrateCanvas.getContext("2d");
        celebrateCanvas.width = window.innerWidth;
        celebrateCanvas.height = window.innerHeight;
        celebrateCanvas.classList.remove("hidden");

        let particles = [];
        let startTs = null;
        let lastBurst = 0;

        function burst() {
            const x = celebrateCanvas.width * (0.15 + Math.random() * 0.7);
            const y = celebrateCanvas.height * (0.1 + Math.random() * 0.4);
            const hue = Math.floor(Math.random() * 360);
            const count = 34 + Math.floor(Math.random() * 22);
            for (let i = 0; i < count; i++) {
                const ang = (Math.PI * 2 * i) / count;
                const sp = 2 + Math.random() * 3.5;
                particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, hue });
            }
        }

        function frame(ts) {
            if (startTs === null) startTs = ts;
            const elapsed = ts - startTs;
            ctx.clearRect(0, 0, celebrateCanvas.width, celebrateCanvas.height);

            if (elapsed < duration && ts - lastBurst > 320) {
                burst();
                lastBurst = ts;
            }

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.03;
                p.life -= 0.012;
            });
            particles = particles.filter((p) => p.life > 0);

            particles.forEach((p) => {
                ctx.globalAlpha = Math.max(p.life, 0);
                ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            if (elapsed < duration || particles.length) {
                requestAnimationFrame(frame);
            } else {
                ctx.clearRect(0, 0, celebrateCanvas.width, celebrateCanvas.height);
                celebrateCanvas.classList.add("hidden");
            }
        }
        requestAnimationFrame(frame);
    }

    function showQuizSuccess() {
        runFireworks(5000);
        quizContainer.classList.add("exiting");
        setTimeout(() => {
            quizContainer.classList.add("hidden");
            quizSuccessMsg.classList.remove("hidden");
        }, 520);
    }

    quizContinueBtn.addEventListener("click", () => {
        showSection(6);
    });

    const loveReasons = [
        "You never judge me — \"mi judge nahi karat,\" and you mean it. With you I can be anything, never scared. 💛",
        "You truly listen — quietly, patiently, shant pane. You'd just hold my hand and let me talk. 🤍",
        "You calm my overthinking. \"Stop overthinking, mi ahe na.\" You became my anchor. ⚓",
        "You're honest even when it's hard — gentle truth over easy comfort. 🌱",
        "Your kindness — for everyone and everything, even the chicken, even strangers. It's just who you are. 🐥",
        "You're so much stronger than you look. You survived so much, and still you rise. 🌸",
        "You notice the smallest things — details about me I'd forgotten myself. 🥹",
        "You respect me and my family, even with no guarantee of a future. That tells me everything. 🤍",
        "You're real and simple — no makeup, hair down, that little 🐣 smile. The most beautiful thing I've seen.",
        "You fight for love, yet you'd never blame me. Fierce and gentle at once — only you. ❤️"
    ];

    const finalLoveMessage = "You complete me, Rajvi — you're the home I was always looking for. 🐣🌝🤍";

    let letterStack = [];

    function initCrushFolder() {
        state.folderOpened = false;
        crushFolder.classList.remove("open");
        folderContinueWrap.classList.remove("show");
        if (folderSub) {
            folderSub.classList.remove("hidden");
            folderSub.textContent = "Tap the folder to open it 📁";
        }

        folderCards.innerHTML = "";
        letterStack = [];
        loveReasons.forEach((reason, idx) => {
            const card = document.createElement("div");
            card.className = "reason-card";
            card.innerHTML = `<span class="reason-num">${idx + 1}</span>${reason}`;
            folderCards.appendChild(card);
            attachLetterDrag(card);
            letterStack.push(card);
        });

        const finalCard = document.createElement("div");
        finalCard.className = "reason-card final-card";
        finalCard.innerHTML = `<span class="final-heart">💖</span>${finalLoveMessage}`;
        folderCards.appendChild(finalCard);
        attachLetterDrag(finalCard);
        letterStack.push(finalCard);
    }

    function layoutLetterStack() {
        letterStack.forEach((card, i) => {
            card.style.zIndex = String(100 - i);
            const ty = i * 9;
            const rot = (i % 2 ? -1 : 1) * Math.min(i * 1.6, 7);
            card._base = { ty, rot };
            card._pos = { x: 0, y: ty, rot: rot };
            card.style.transition = "transform 0.35s ease, opacity 0.35s ease";
            card.style.transform = `translate(0px, ${ty}px) rotate(${rot}deg)`;
            card.style.cursor = i === 0 ? "grab" : "default";
            card.classList.toggle("is-top", i === 0);
        });
    }

    function attachLetterDrag(card) {
        let dragging = false, sx = 0, sy = 0, startX = 0, startY = 0, startRot = 0, moved = false;

        card.addEventListener("pointerdown", (e) => {
            const isTop = letterStack[0] === card;
            const isDropped = card.classList.contains("dropped");
            if (!isTop && !isDropped) return;
            dragging = true;
            moved = false;
            sx = e.clientX; sy = e.clientY;
            startX = card._pos.x; startY = card._pos.y; startRot = card._pos.rot;
            card.setPointerCapture(e.pointerId);
            card.style.transition = "none";
            card.style.cursor = "grabbing";
            card.style.zIndex = "300";
            e.preventDefault();
        });

        card.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            const dx = e.clientX - sx, dy = e.clientY - sy;
            const nx = startX + dx, ny = startY + dy;
            const rot = startRot + dx * 0.04;
            card._pos = { x: nx, y: ny, rot: rot };
            moved = true;
            card.style.transform = `translate(${nx}px, ${ny}px) rotate(${rot}deg)`;
        });

        function end(e) {
            if (!dragging) return;
            dragging = false;
            card.style.cursor = "grab";
            const dx = e.clientX - sx, dy = e.clientY - sy;
            const dist = Math.hypot(dx, dy);
            const wasTop = letterStack[0] === card;

            if (wasTop && dist <= 40) {
                card.style.transition = "transform 0.3s ease";
                card._pos = { x: 0, y: card._base.ty, rot: card._base.rot };
                card.style.transform =
                    `translate(0px, ${card._base.ty}px) rotate(${card._base.rot}deg)`;
                layoutLetterStack();
                return;
            }

            card.style.transition = "none";
            card.style.transform =
                `translate(${card._pos.x}px, ${card._pos.y}px) rotate(${card._pos.rot}deg)`;
            card.style.zIndex = "60";

            if (wasTop) {
                card.classList.remove("is-top");
                card.classList.add("dropped");
                letterStack.shift();
                layoutLetterStack();
                if (letterStack.length === 0) {
                    if (folderSub) folderSub.textContent = "That's everything in my heart 💖";
                    folderContinueWrap.classList.add("show");
                }
            }
        }

        card.addEventListener("pointerup", end);
        card.addEventListener("pointercancel", end);
    }

    function openCrushFolder() {
        if (state.folderOpened) return;
        state.folderOpened = true;
        crushFolder.classList.add("open");
        if (folderSub) folderSub.textContent = "Drag each letter away to read the one beneath 💌";

        letterStack.forEach((card) => { card.style.opacity = "1"; });
        layoutLetterStack();
    }

    crushFolder.addEventListener("click", openCrushFolder);

    folderContinueBtn.addEventListener("click", () => {
        showSection(7);
    });

    const puzzleBoard = document.getElementById("puzzle-board");
    const puzzleMovesEl = document.getElementById("puzzle-moves");
    const puzzleSub = document.getElementById("puzzle-sub");
    const puzzleContinueBtn = document.getElementById("puzzle-continue-btn");
    const puzzleDiffBtns = document.querySelectorAll(".puzzle-diff-btn");
    const puzzleShuffleBtn = document.getElementById("puzzle-shuffle");
    const puzzleImage = "assets/galary/b8.jpg";

    let puzzleSize = 3;
    let puzzleTiles = [];
    let puzzleMoveCount = 0;
    let puzzleSolved = false;

    function puzzleBlankVal() {
        return puzzleSize * puzzleSize - 1;
    }

    function isPuzzleSolved() {
        return puzzleTiles.every((val, pos) => val === pos);
    }

    function renderPuzzle() {
        const n = puzzleSize;
        const blank = puzzleBlankVal();
        puzzleBoard.style.setProperty("--n", n);
        puzzleBoard.innerHTML = "";

        puzzleTiles.forEach((val, pos) => {
            const tile = document.createElement("div");
            tile.className = "puzzle-tile";

            if (val === blank && !puzzleSolved) {
                tile.classList.add("blank");
            } else {
                const homeRow = Math.floor(val / n);
                const homeCol = val % n;
                tile.style.backgroundImage = `url("${puzzleImage}")`;
                tile.style.backgroundSize = `${n * 100}% ${n * 100}%`;
                tile.style.backgroundPosition =
                    `${(homeCol / (n - 1)) * 100}% ${(homeRow / (n - 1)) * 100}%`;
            }

            tile.addEventListener("click", () => tryPuzzleMove(pos));
            puzzleBoard.appendChild(tile);
        });
    }

    function tryPuzzleMove(pos) {
        if (puzzleSolved) return;
        const n = puzzleSize;
        const blankPos = puzzleTiles.indexOf(puzzleBlankVal());

        const r1 = Math.floor(pos / n), c1 = pos % n;
        const r2 = Math.floor(blankPos / n), c2 = blankPos % n;
        const adjacent = (r1 === r2 && Math.abs(c1 - c2) === 1) ||
                         (c1 === c2 && Math.abs(r1 - r2) === 1);
        if (!adjacent) return;

        [puzzleTiles[pos], puzzleTiles[blankPos]] = [puzzleTiles[blankPos], puzzleTiles[pos]];
        puzzleMoveCount++;
        puzzleMovesEl.textContent = `Moves: ${puzzleMoveCount}`;

        if (isPuzzleSolved()) {
            handlePuzzleWin();
        } else {
            renderPuzzle();
        }
    }

    function handlePuzzleWin() {
        puzzleSolved = true;
        renderPuzzle();
        puzzleBoard.classList.add("solved");
        puzzleSub.textContent = "You pieced us together perfectly 💖";
        puzzleContinueBtn.classList.remove("hidden");
        runFireworks(4000);
    }

    function neighborsOf(blankPos) {
        const n = puzzleSize;
        const r = Math.floor(blankPos / n), c = blankPos % n;
        const list = [];
        if (r > 0) list.push(blankPos - n);
        if (r < n - 1) list.push(blankPos + n);
        if (c > 0) list.push(blankPos - 1);
        if (c < n - 1) list.push(blankPos + 1);
        return list;
    }

    function shufflePuzzle() {
        const count = puzzleSize * puzzleSize;
        puzzleTiles = Array.from({ length: count }, (_, i) => i);

        // Perform many random valid blank-swaps so the result is always solvable.
        let blankPos = count - 1;
        let prev = -1;
        const steps = count * count * 6;
        for (let s = 0; s < steps; s++) {
            const opts = neighborsOf(blankPos).filter((p) => p !== prev);
            const pick = opts[Math.floor(Math.random() * opts.length)];
            [puzzleTiles[blankPos], puzzleTiles[pick]] =
                [puzzleTiles[pick], puzzleTiles[blankPos]];
            prev = blankPos;
            blankPos = pick;
        }

        // Guard against the rare fully-solved shuffle.
        if (isPuzzleSolved()) {
            const a = neighborsOf(blankPos)[0];
            [puzzleTiles[blankPos], puzzleTiles[a]] =
                [puzzleTiles[a], puzzleTiles[blankPos]];
        }
    }

    function initPuzzle() {
        puzzleSolved = false;
        puzzleMoveCount = 0;
        puzzleMovesEl.textContent = "Moves: 0";
        puzzleBoard.classList.remove("solved");
        puzzleSub.textContent = "Slide the tiles to fix our photo 💕";
        puzzleContinueBtn.classList.add("hidden");
        shufflePuzzle();
        renderPuzzle();
    }

    puzzleDiffBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const size = Number(btn.dataset.size);
            if (size === puzzleSize && !puzzleSolved) {
                // same size — just reshuffle
                initPuzzle();
                puzzleDiffBtns.forEach((b) => b.classList.toggle("active", b === btn));
                return;
            }
            puzzleSize = size;
            puzzleDiffBtns.forEach((b) => b.classList.toggle("active", b === btn));
            initPuzzle();
        });
    });

    if (puzzleShuffleBtn) {
        puzzleShuffleBtn.addEventListener("click", () => initPuzzle());
    }

    if (puzzleContinueBtn) {
        puzzleContinueBtn.addEventListener("click", () => showSection(4));
    }

    if (navBack) navBack.addEventListener("click", () => {
        if (state.currentSectionIndex > 0) {
            showSection(state.currentSectionIndex - 1);
        }
    });

    if (stepToggle) {
        stepToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = stepNav.classList.toggle("open");
            stepToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.addEventListener("click", (e) => {
        if (stepNav && stepNav.classList.contains("open") && !stepNav.contains(e.target)) {
            stepNav.classList.remove("open");
            stepToggle.setAttribute("aria-expanded", "false");
        }
    });

    stepButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = Number(btn.dataset.step);
            if (stepNav) {
                stepNav.classList.remove("open");
                if (stepToggle) stepToggle.setAttribute("aria-expanded", "false");
            }
            if (target === state.currentSectionIndex) return;
            startMusic();
            showSection(target);
        });
    });
});
