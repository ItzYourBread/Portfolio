(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const nav = document.getElementById("site-nav")
    const navToggle = document.querySelector(".nav-toggle")

    const setNavOpen = (open) => {
        if (!nav || !navToggle) return
        navToggle.setAttribute("aria-expanded", open ? "true" : "false")
        nav.classList.toggle("is-open", open)
    }

    if (navToggle && nav) {
        navToggle.addEventListener("click", () => {
            const isOpen = navToggle.getAttribute("aria-expanded") === "true"
            setNavOpen(!isOpen)
        })

        document.addEventListener("click", (e) => {
            if (!nav.classList.contains("is-open")) return
            if (nav.contains(e.target) || navToggle.contains(e.target)) return
            setNavOpen(false)
        })
    }

    // Smooth scroll + close mobile menu
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const targetSelector = anchor.getAttribute("href")
            if (!targetSelector) return
            if (targetSelector === "#") {
                e.preventDefault()
                return
            }

            const target = document.querySelector(targetSelector)
            if (!target) return

            e.preventDefault()
            setNavOpen(false)

            target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" })
        })
    })

    // Reveal on scroll
    const revealItems = Array.from(document.querySelectorAll(".reveal"))
    if (revealItems.length && !prefersReducedMotion && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    entry.target.classList.add("is-visible")
                    revealObserver.unobserve(entry.target)
                })
            },
            { threshold: 0.12 }
        )
        revealItems.forEach((el) => revealObserver.observe(el))
    } else {
        revealItems.forEach((el) => el.classList.add("is-visible"))
    }

    // Scroll spy for active nav item
    const sectionIds = ["about", "bio", "education", "family", "timeline", "work", "gallery", "links"]
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)
    const navLinks = new Map(
        Array.from(document.querySelectorAll('.nav a[href^="#"]')).map((a) => [a.getAttribute("href")?.slice(1), a])
    )

    const setActive = (id) => {
        navLinks.forEach((link, linkId) => {
            link.classList.toggle("is-active", linkId === id)
        })
    }

    if (sections.length && "IntersectionObserver" in window) {
        const spyObserver = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))
                if (!visible.length) return
                setActive(visible[0].target.id)
            },
            { rootMargin: "-20% 0px -70% 0px", threshold: [0.02, 0.12, 0.2] }
        )
        sections.forEach((s) => spyObserver.observe(s))
    }

    // Lightbox
    const lightbox = document.querySelector(".lightbox")
    const lightboxImg = document.querySelector(".lightbox-img")
    const lightboxClose = document.querySelector(".lightbox-close")
    const galleryButtons = Array.from(document.querySelectorAll(".gallery-item[data-full]"))

    const setScrollLock = (lock) => {
        document.documentElement.style.overflow = lock ? "hidden" : ""
    }

    const closeLightbox = () => {
        if (!lightbox || !lightboxImg) return
        lightbox.hidden = true
        lightboxImg.src = ""
        lightboxImg.alt = ""
        setScrollLock(false)
    }

    const openLightbox = (src, alt) => {
        if (!lightbox || !lightboxImg) return
        lightboxImg.src = src
        lightboxImg.alt = alt || ""
        lightbox.hidden = false
        setScrollLock(true)
        lightboxClose?.focus()
    }

    if (lightbox && lightboxClose) {
        // Ensure consistent state on refresh even if markup/CSS changes.
        closeLightbox()

        lightboxClose.addEventListener("click", closeLightbox)
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox()
        })
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !lightbox.hidden) closeLightbox()
        })
    }

    galleryButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const src = btn.getAttribute("data-full")
            const img = btn.querySelector("img")
            const alt = img?.getAttribute("alt") || "Gallery image"
            if (!src) return
            openLightbox(src, alt)
        })
    })
})()
