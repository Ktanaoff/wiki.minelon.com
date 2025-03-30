document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const sidebarCollapsibles = document.querySelectorAll('.left-sidebar .collapsible');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const mainContentArea = document.getElementById('main-content-area');
    const contentWrappers = mainContentArea.querySelectorAll('.content-wrapper');
    const sidebarFilterInput = document.getElementById('sidebar-filter-input');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const pageNavLinks = document.querySelectorAll('.page-nav a');
    const rightSidebarArea = document.getElementById('right-sidebar-area');

    const menuToggleButton = document.getElementById('menu-toggle');
    const leftSidebar = document.getElementById('left-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseButton = document.getElementById('sidebar-close');

    const headerSearchInput = document.getElementById('main-search');
    const headerSearchIcon = document.getElementById('header-search-icon');
    const searchModalOverlay = document.getElementById('search-modal-overlay');
    const searchModal = document.getElementById('search-modal');
    const searchModalInput = document.getElementById('search-modal-input');
    const searchModalResultsContainer = document.getElementById('search-modal-results');
    const searchModalPlaceholder = searchModalResultsContainer.querySelector('.search-modal-placeholder');
    const searchModalNoResults = document.querySelector('.search-modal-no-results');
    let searchIndex = []; 


    let tocObserver = null;
    const tocLinksCache = {}; 


    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggleButton.addEventListener('click', () => {
        let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggleButton.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon'); icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun'); icon.classList.add('fa-moon');
        }
    }

    sidebarCollapsibles.forEach(item => {
        const header = item.querySelector('.nav-item-header');
        const subMenu = item.querySelector('.sub-menu');

        if (header && subMenu) {
             const isActiveParent = item.querySelector('.sub-menu .nav-item.active');
             if (isActiveParent) {
                 item.classList.remove('collapsed'); setSubMenuHeight(item, subMenu);
             } else {
                 item.classList.add('collapsed'); subMenu.style.maxHeight = '0px';
             }

            header.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && e.target.closest('.nav-item-header') === header) {
                    const targetHref = e.target.getAttribute('href');
                    const targetLink = Array.from(sidebarLinks).find(link => link.getAttribute('href') === targetHref);
                    if (targetLink) handleLinkClick(e, targetLink);
                    return;
                }
                e.preventDefault();
                toggleSubMenu(item, subMenu);
            });
        }
    });

    function toggleSubMenu(item, subMenu) {
         item.classList.toggle('collapsed');
         setSubMenuHeight(item, subMenu);
    }

    function setSubMenuHeight(item, subMenu) {
        if (!item.classList.contains('collapsed')) {
             subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
        } else {
             subMenu.style.maxHeight = '0px';
        }
    }

    window.addEventListener('resize', () => {
        document.querySelectorAll('.left-sidebar .collapsible:not(.collapsed)').forEach(item => {
            const subMenu = item.querySelector('.sub-menu');
            if(subMenu) setSubMenuHeight(item, subMenu);
        });
    });


    function setActiveLink(targetLink) {
        navItems.forEach(item => item.classList.remove('active')); 

        if (targetLink) {
            const parentNavItem = targetLink.closest('.nav-item');
            if (parentNavItem) parentNavItem.classList.add('active');

            const parentCollapsible = targetLink.closest('.collapsible');
            if (parentCollapsible) {
                parentCollapsible.classList.add('active'); 
                 if (parentCollapsible.classList.contains('collapsed')) {
                     const subMenu = parentCollapsible.querySelector('.sub-menu');
                     if (subMenu) {
                         parentCollapsible.classList.remove('collapsed');
                         setSubMenuHeight(parentCollapsible, subMenu);
                     }
                 }
             }
        }
    }

    function showContent(pageId) {
        let foundPage = false;
        contentWrappers.forEach(wrapper => {
            if (wrapper.getAttribute('data-page') === pageId) {
                wrapper.classList.remove('hidden');
                foundPage = true;
                updateRightSidebar(pageId); 
            } else {
                wrapper.classList.add('hidden');
            }
        });

        if (!foundPage) {
            const defaultPage = mainContentArea.querySelector('[data-page="hosgeldin"]');
            if (defaultPage) {
                 defaultPage.classList.remove('hidden');
                 updateRightSidebar('hosgeldin');
            } else {
                 rightSidebarArea.innerHTML = '';
                 rightSidebarArea.style.display = 'none';
            }
            console.warn(`Content for pageId "${pageId}" not found. Showing default.`);
             if(pageId !== 'hosgeldin') history.replaceState(null, '', '#hosgeldin');
        }
         mainContentArea.scrollTop = 0;
         window.scrollTo(0, 0);
    }

    function handleLinkClick(event, linkElement) {
         event.preventDefault();
         let targetPageId;

         if (linkElement.hasAttribute('data-target-page')) {
             targetPageId = linkElement.getAttribute('data-target-page');
             const targetSidebarLink = document.querySelector(`.sidebar-nav a[href="#${targetPageId}"]`);
             setActiveLink(targetSidebarLink);
         } else {
             targetPageId = linkElement.getAttribute('href').substring(1);
             setActiveLink(linkElement);
         }

         if (targetPageId) {
             showContent(targetPageId);
             history.replaceState(null, '', `#${targetPageId}`);
         } else {
            console.error("Target page ID not found for link:", linkElement);
         }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => handleLinkClick(e, link));
    });

    pageNavLinks.forEach(link => {
         link.addEventListener('click', (e) => handleLinkClick(e, link));
     });

    function loadContentFromHash() {
        let hash = window.location.hash.substring(1);
        hash = hash.replace(/[^a-zA-Z0-9-_]/g, '');
        const targetPageId = hash || 'hosgeldin';
        const targetLink = document.querySelector(`.sidebar-nav a[href="#${targetPageId}"]`);

        if (targetLink) {
             setActiveLink(targetLink);
             showContent(targetPageId);
        } else {
             setActiveLink(document.querySelector('.sidebar-nav a[href="#hosgeldin"]'));
             showContent('hosgeldin');
             history.replaceState(null, '', '#hosgeldin');
        }
    }


     function openMobileMenu() {
         if (leftSidebar && sidebarOverlay) {
            leftSidebar.classList.add('open');
            sidebarOverlay.classList.remove('hidden');
          
         }
     }

     function closeMobileMenu() {
         if (leftSidebar && sidebarOverlay) {
            leftSidebar.classList.remove('open');
            sidebarOverlay.classList.add('hidden');
         }
     }

     if (menuToggleButton) {
         menuToggleButton.addEventListener('click', () => {
             if (leftSidebar.classList.contains('open')) closeMobileMenu();
             else openMobileMenu();
         });
     }
     if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileMenu);
     if (sidebarCloseButton) sidebarCloseButton.addEventListener('click', closeMobileMenu);

     if (leftSidebar) {
         leftSidebar.addEventListener('click', (e) => {
             if (e.target.tagName === 'A' || e.target.closest('a')) {
                 if (!e.target.closest('#sidebar-close')) {
                     closeMobileMenu();
                 }
             }
         });
     }


    sidebarFilterInput.addEventListener('input', () => {
        const filterText = sidebarFilterInput.value.toLowerCase().trim();
        const allNavLi = document.querySelectorAll('.sidebar-nav > ul > li');

        allNavLi.forEach(topLi => {
             let isTopMatch = false;
             const topLink = topLi.querySelector(':scope > a, :scope > .nav-item-header > a');
             if (topLink && topLink.textContent.toLowerCase().includes(filterText)) isTopMatch = true;

             let hasVisibleChild = false;
             if (topLi.classList.contains('collapsible')) {
                 const subItems = topLi.querySelectorAll('.sub-menu > li.nav-item');
                 subItems.forEach(subItem => {
                     const subLink = subItem.querySelector('a');
                     const isSubMatch = subLink && subLink.textContent.toLowerCase().includes(filterText);
                     if (isSubMatch) { subItem.classList.remove('hidden'); hasVisibleChild = true; }
                     else { subItem.classList.add('hidden'); }
                 });
             }

             if (isTopMatch || hasVisibleChild || filterText === '') {
                 topLi.classList.remove('hidden');
                 if (hasVisibleChild && topLi.classList.contains('collapsible')) {
                    topLi.querySelectorAll('.sub-menu > li.nav-item').forEach(subItem => {
                        const subLink = subItem.querySelector('a');
                         if (subLink && subLink.textContent.toLowerCase().includes(filterText)) subItem.classList.remove('hidden');
                     });
                 }
                 if (filterText === '' && topLi.classList.contains('collapsible')) {
                    topLi.querySelectorAll('.sub-menu > li.nav-item').forEach(subItem => subItem.classList.remove('hidden'));
                 }
             } else {
                 topLi.classList.add('hidden');
             }
        });

        document.querySelectorAll('.left-sidebar .collapsible:not(.collapsed) .sub-menu').forEach(subMenu => {
              const parentItem = subMenu.closest('.collapsible');
              if(parentItem) setSubMenuHeight(parentItem, subMenu);
         });
    });


    function updateRightSidebar(pageId) {
        rightSidebarArea.innerHTML = ''; 
        rightSidebarArea.style.display = 'none';
        if (tocObserver) { tocObserver.disconnect(); tocObserver = null; } 
        Object.keys(tocLinksCache).forEach(key => delete tocLinksCache[key]);

        const currentPageWrapper = mainContentArea.querySelector(`.content-wrapper[data-page="${pageId}"]`);
        if (!currentPageWrapper) return;

        const headings = currentPageWrapper.querySelectorAll('h2, h3');

        if (headings.length > 0) {
            const contentsTitle = document.createElement('h4');
            contentsTitle.className = 'contents-title';
            contentsTitle.textContent = 'İçindekiler';
            rightSidebarArea.appendChild(contentsTitle);

            const contentsList = document.createElement('ul');
            contentsList.className = 'contents-list';

            headings.forEach(heading => {
                if (!heading.id) {
                    heading.id = `toc-${heading.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`;
                }
                if (!heading.id) return; 

                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `#${heading.id}`;
                link.textContent = heading.textContent;
                link.classList.add(`toc-${heading.tagName.toLowerCase()}`);

                tocLinksCache[heading.id] = link; 

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById(heading.id);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        history.replaceState(null, '', `#${heading.id}`);
                
                        document.querySelectorAll('.contents-list a.active').forEach(a => a.classList.remove('active'));
                        link.classList.add('active');
                    }
                });

                listItem.appendChild(link);
                contentsList.appendChild(listItem);
            });
            rightSidebarArea.appendChild(contentsList);
            rightSidebarArea.style.display = 'block';

            setupTocObserver(headings);
        }
    }

    function setupTocObserver(headings) {
        if (tocObserver) tocObserver.disconnect(); 

        const observerOptions = {
            root: mainContentArea, 
            rootMargin: '0px 0px -65% 0px', 
            threshold: 0
        };

        let lastActiveTocLink = null;

        tocObserver = new IntersectionObserver((entries) => {
            let topmostIntersectingEntry = null;

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!topmostIntersectingEntry || entry.boundingClientRect.top < topmostIntersectingEntry.boundingClientRect.top) {
                        topmostIntersectingEntry = entry;
                    }
                }
            });

            if (topmostIntersectingEntry) {
                const targetId = topmostIntersectingEntry.target.id;
                const activeTocLink = tocLinksCache[targetId]; 

                if (activeTocLink && activeTocLink !== lastActiveTocLink) {
                    if (lastActiveTocLink) lastActiveTocLink.classList.remove('active');
                    activeTocLink.classList.add('active');
                    lastActiveTocLink = activeTocLink;

                 
                }
            }
         

        }, observerOptions);

      
        headings.forEach(heading => {
            if (heading.id) tocObserver.observe(heading);
        });
    }



     function buildSearchIndex() {
        searchIndex = [];
        contentWrappers.forEach(wrapper => {
            const pageId = wrapper.getAttribute('data-page');
            const titleElement = wrapper.querySelector('h1');
            const title = titleElement ? titleElement.textContent.trim() : 'Untitled';
            let content = '';
            wrapper.querySelectorAll('p, li, h2, h3, h4, pre code, .callout-content').forEach(el => {
                content += el.textContent.trim() + ' ';
            });
            if (pageId && title && content) {
                searchIndex.push({ id: pageId, title, content });
            }
        });
     }

     function performSearch(term) {
         term = term.trim(); 
         if (!term) {
             displayResults([], term); 
             return;
         }
         const lowerCaseTerm = term.toLowerCase();
         const results = searchIndex.filter(item =>
             item.title.toLowerCase().includes(lowerCaseTerm) ||
             item.content.toLowerCase().includes(lowerCaseTerm)
         );
         displayResults(results, term);
     }

     function displayResults(results, term) {
         searchModalResultsContainer.innerHTML = '';
         searchModalPlaceholder.classList.add('hidden');
         searchModalNoResults.classList.add('hidden');

         if (!term) {
             searchModalPlaceholder.classList.remove('hidden');
             return;
         }

         if (results.length === 0) {
             searchModalNoResults.textContent = `"${term}" için sonuç bulunamadı.`;
             searchModalNoResults.classList.remove('hidden');
             return;
         }

         results.forEach(result => {
             const item = document.createElement('a');
             item.href = `#${result.id}`; 
             item.classList.add('search-modal-result-item');

             const snippetLength = 100;
             let snippet = '';
             const contentLower = result.content.toLowerCase();
             const termIndex = contentLower.indexOf(term.toLowerCase());

             if (termIndex > -1) {
                 const start = Math.max(0, termIndex - snippetLength / 2);
                 snippet = result.content.substring(start, start + snippetLength);
                 if (start > 0) snippet = "..." + snippet;
                 if (start + snippetLength < result.content.length) snippet += "...";
             } else {
                 snippet = result.content.substring(0, snippetLength) + "...";
             }

             item.innerHTML = `
                 <div class="title">${result.title}</div>
                 <div class="snippet">${snippet.replace(/</g, "<").replace(/>/g, ">")}</div> {/* Basic HTML escape */}
             `;
             item.addEventListener('click', () => {
  
                  closeSearchModal(); 
             });
             searchModalResultsContainer.appendChild(item);
         });
     }

     function openSearchModal() {
         searchModalOverlay.classList.remove('hidden');
         searchModal.classList.remove('hidden');
         searchModalInput.focus();
         performSearch(searchModalInput.value); 
     }

     function closeSearchModal() {
         searchModalOverlay.classList.add('hidden');
         searchModal.classList.add('hidden');
         searchModalInput.value = '';
         searchModalResultsContainer.innerHTML = '';
         searchModalPlaceholder.classList.remove('hidden');
     }

     if (headerSearchInput) headerSearchInput.addEventListener('focus', openSearchModal);
     if (headerSearchIcon) headerSearchIcon.addEventListener('click', openSearchModal);
     searchModalInput.addEventListener('input', () => performSearch(searchModalInput.value));
     searchModalOverlay.addEventListener('click', closeSearchModal);
     window.addEventListener('keydown', (e) => {
         if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) closeSearchModal();
     });



    
    buildSearchIndex(); 
    closeMobileMenu();
    loadContentFromHash(); 

    window.addEventListener('hashchange', loadContentFromHash);

});