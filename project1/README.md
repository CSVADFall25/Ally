### Overview

Blind Palette is a drawing tool that lets users paint without knowing what colors they’re using until they choose to reveal them. Instead of seeing color feedback immediately, the user has to rely on their sense of movement, spacing, and intuition. It’s interesting to see how we make visual choices when we can’t depend on color cues. The project fits the theme of creating a drawing tool that includes an aesthetic constraint. In this case, that constraint is the hidden color palette. You can only see shades of grey while painting. Once you hit “Reveal,” the full color version appears.

### How it works

When the sketch loads, there’s a control panel on the left and a blank canvas on the right. The left side includes:
- A grid of 80 color buttons (10 columns × 8 rows), shown in different shades of grey.
- A brush size slider.
- Buttons for Erase, Clear, and Reveal.
- Options to Shuffle or Reset the palette.
- A toggle between Free Draw mode and Paint by Numbers mode.

In Free Draw mode, users can draw freely on a blank canvas. In Paint by Numbers, they can upload an image and use it as a reference underneath their strokes like coloring over a faint guide. The “Reveal” button switches between showing colors and keeping everything greyed out. I titled the image upload portion “Paint by Numbers” because I used to do some of the paint by numbers, and the idea of having an outline underneath what you’re coloring made sense as a simple metaphor for the feature.

Functionally, the system runs on two layered canvases created with createGraphics(): one for free drawing and one for painting over an uploaded image. This structure makes it easier to reset, clear, or swap between modes without losing the previous work. All drawing actions happen on the selected layer, while the sidebar UI elements stay separate, so users never accidentally paint over the interface.

When the palette is hidden, each button looks like a neutral tone, but, each one actually corresponds to a unique hue saturation pair generated using the HSB color model. The color’s hue changes as you move horizontally across the grid, and the saturation increases as you move downward. This ensures the palette spans a wide range of colors even though everything looks greyed out. When the user presses “Reveal,” all buttons display their true colors.

The drawing process itself uses the mouseDragged() function to continuously track movement and draw smooth strokes. The line’s color is based on the user’s current selection, and its thickness is set by the brush size slider. The eraser mode works by toggling erase() and noErase() so that strokes remove instead of adding color.

The upload feature allows users to select an image from their computer. Once uploaded, the image is automatically scaled to fit the available drawing space. I used the same code from the opencv examples from mini assignment 3 to add the picture as a background image.

### Process

I started by setting up two drawing layers (one for free drawing and one for the paint-by-numbers mode). Using separate layers made it easier to switch between modes and reset them independently. From there, I focused on getting the palette grid working each button stores a color value and its greyscale version. The reveal feature works by toggling a boolean (it is called showColors), which changes both the display of the palette and whether the drawing layer is shown in color or grayscale.

I originally picked this idea because I had seen people on TikTok doing something similar, called the greyscale challenge, where artists draw on their ipad/tablet entirely in grayscale and then reveal the real colors at the end. I always found those videos interesting because it’s fun to see how different everything looks once the colors appear. Additionally, it never looks how you expect.

The main design goal was to make the interface clear enough that users could figure out how to use it just by looking at it. Every element on the screen has a visual or spatial logic. The controls stay on the left, the drawing area fills the rest of the window, and buttons are grouped by what they do. For example, all color-related actions (the palette grid, shuffle, and reset) sit together, while utility buttons like erase, clear, and reveal are placed below them. The labels use small emojis to correspond to what the buttons do.

I chose to use HSB over RGB for color. It allows smoother control over hue and saturation compared to RGB, which helps distribute colors evenly across the palette grid. Hue changes horizontally across the columns, while saturation increases down each row. The brightness mapping used for the greyscale version of the palette ensures that the grid still looks varied, even when colors are hidden.

One of the trickier parts was handling the uploaded image scaling so it would fit cleanly inside the canvas without overlapping the sidebar. I also added a shuffle function for the palette so that even if a user starts to remember where certain colors are (such as if they used this application a lot), they can randomize the grid and then they will not know the order.
