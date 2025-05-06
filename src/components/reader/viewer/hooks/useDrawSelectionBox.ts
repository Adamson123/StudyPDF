"use client";
import { MouseEvent, RefObject, useEffect, useState } from "react";
import { generateClass } from "../selection-menu/selecton-menu-utils";

const useDrawRectangle = (
  divRef: RefObject<HTMLDivElement>,
  selectionBoxMode: boolean,
) => {
  useEffect(() => {
    const pdfsContainer = divRef.current as HTMLDivElement;
    if (!pdfsContainer) return;
    //const pdfPageContainerRect = pdfsContainer.getBoundingClientRect();

    let pdfPageContainer: HTMLDivElement;
    let pdfPageContainerRect: DOMRect;

    if (selectionBoxMode) {
      pdfsContainer.querySelectorAll("span").forEach((span) => {
        span.style.pointerEvents = "none";
      });
      pdfsContainer.style.userSelect = "none";
    } else {
      pdfsContainer.querySelectorAll("span").forEach((span) => {
        span.style.pointerEvents = "auto";
      });
      pdfsContainer.style.userSelect = "initial";
    }

    const getMousePos = (event: MouseEvent | TouchEvent | any) => {
      //start the y axis of the mouse from pdf container top
      // const mousePosX = Math.round(clientX - pdfPageContainerRect.left);
      // //start the x axis of the mouse from pdf container left
      // const mousePosY = Math.round(clientY - pdfPageContainerRect.top);
      let mousePosX: number = 0,
        mousePosY: number = 0;
      if ("touches" in event && event.touches.length > 0) {
        const { clientX, clientY } = event.touches[0];
        mousePosX = Math.round(clientX - pdfPageContainerRect.left) + scrollX;
        mousePosY = Math.round(clientY - pdfPageContainerRect.top);
      } else if ("clientX" in event) {
        const { clientX, clientY } = event;
        mousePosX = Math.round(clientX - pdfPageContainerRect.left) + scrollX;
        mousePosY = Math.round(clientY - pdfPageContainerRect.top);
      }

      return { mousePosX, mousePosY };
    };

    const handlePdfPageSelection = (event: MouseEvent | any) => {
      // const mousePosY = Math.round(clientY - pdfPageContainerRect.top);
      let clientX = 0,
        clientY = 0;
      if ("touches" in event && event.touches.length > 0) {
        const { clientX: x, clientY: y } = event.touches[0];
        clientX = x;
        clientY = y;
      } else if ("clientX" in event) {
        const { clientX: x, clientY: y } = event;
        clientX = x;
        clientY = y;
      }
      pdfsContainer
        .querySelectorAll<HTMLDivElement>(".pdfContainer")!
        .forEach((pdfContainer, index) => {
          const pdfContainerRect = pdfContainer.getBoundingClientRect();
          if (
            clientX > pdfContainerRect.left &&
            clientX < pdfContainerRect.right &&
            clientY > pdfContainerRect.top &&
            clientY < pdfContainerRect.bottom
          ) {
            console.log({ index: index + 1 });
            pdfPageContainer = pdfContainer;
            pdfPageContainerRect = pdfContainerRect;
          }
        });
    };

    let isMouseDown = false;
    let isMouseExpandingRight = false;
    let isMouseExpandingLeft = false;
    let isMouseExpandingBottom = false;
    let isMouseExpandingTop = false;

    let startMouseX = 0;
    let startMouseY = 0;

    let selectionBox: HTMLDivElement | undefined;
    let selectionBoxToExpand: HTMLDivElement;

    const selectionBoxStartingSize = 0;
    const extraSize = 0;

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    const resetExpansionState = () => {
      isMouseExpandingRight = false;
      isMouseExpandingLeft = false;
      isMouseExpandingTop = false;
      isMouseExpandingBottom = false;
    };

    const createSelectionBox = () => {
      const newSelectionBox = document.createElement("div");
      newSelectionBox.style.zIndex = 100 + "";
      newSelectionBox.style.width = selectionBoxStartingSize + "px";
      newSelectionBox.style.height = selectionBoxStartingSize + "px";
      newSelectionBox.classList.add("selectionBox");
      newSelectionBox.id = generateClass("selectionBox");

      let isMouseDownOnSelectionBox = false;

      let dragStartX: number;
      let dragStartY: number;

      const newSelectionBoxTouchDown = (
        event: MouseEvent | TouchEvent | any,
      ) => {
        if (!selectionBoxMode) return;
        event.stopImmediatePropagation();
        document.body.style.overflowY = "hidden";
        handlePdfPageSelection(event);
        //Set this selection box as the active
        pdfsContainer
          .querySelectorAll(".selectionBox")
          .forEach((selectionBox) => {
            selectionBox.querySelectorAll("span").forEach((span) => {
              span.style.display = "none";
            });
          });

        newSelectionBox.querySelectorAll("span").forEach((span) => {
          span.style.display = "initial";
        });

        isMouseDownOnSelectionBox = true;
        const { mousePosX, mousePosY } = getMousePos(event);
        const newSelectionBoxRect = newSelectionBox.getBoundingClientRect();

        //The left of pos of selectionBox starting  from the left of pdfsContainer
        const left = newSelectionBoxRect.left - pdfPageContainerRect.left;
        //The top of pos of selectionBox starting  from the top of pdfsContainer
        const top = newSelectionBoxRect.top - pdfPageContainerRect.top;

        //Where we would start dragging this selection box from , this would be base on where mouse down event starts in the selection box
        dragStartX = mousePosX - left;
        dragStartY = mousePosY - top;

        newSelectionBox.style.left = mousePosX - dragStartX + "px";
        newSelectionBox.style.top = mousePosY - dragStartY + "px";
      };

      const newSelectionBoxTouchMove = (
        event: MouseEvent | TouchEvent | any,
      ) => {
        if (!isMouseDownOnSelectionBox || !selectionBoxMode) return;
        const { mousePosX, mousePosY } = getMousePos(event);

        const left = mousePosX - dragStartX;
        const top = mousePosY - dragStartY;

        const newSelectionBoxRect = newSelectionBox.getBoundingClientRect();

        //To prevent dragging out of pdf container horizontally
        if (
          left >= 0 &&
          left + pdfPageContainerRect.left + newSelectionBoxRect.width <=
            pdfPageContainerRect.right
        ) {
          newSelectionBox.style.left = left + "px";
        }

        //To prevent dragging out of pdf container vertically
        if (
          top >= 0 &&
          top + pdfPageContainerRect.top + newSelectionBoxRect.height <=
            pdfPageContainerRect.bottom //  pdfPageContainerRect.height / 18 + pdfPageContainerRect.top - 3
        ) {
          newSelectionBox.style.top = top + "px";
        }
      };

      const handleMouseLeave = (event: MouseEvent | any) => {
        event.stopPropagation();
        isMouseDownOnSelectionBox = false;
        resetExpansionState();
      };
      if (!isMobile) {
        // Mouse events for PC
        newSelectionBox.onmousedown = newSelectionBoxTouchDown;
        newSelectionBox.onmousemove = newSelectionBoxTouchMove;
        newSelectionBox.onmouseup = handleMouseLeave;
        newSelectionBox.onmouseout = handleMouseLeave;
      } else {
        // Touch events for Mobile
        newSelectionBox.ontouchmove = newSelectionBoxTouchMove;
        newSelectionBox.ontouchstart = newSelectionBoxTouchDown;
        newSelectionBox.ontouchend = handleMouseLeave;
        newSelectionBox.ontouchcancel = handleMouseLeave;
      }

      const innerNewSelectionBox = document.createElement("div");
      innerNewSelectionBox.style.position = "relative";
      innerNewSelectionBox.style.width = "100%";
      innerNewSelectionBox.style.height = "100%";
      innerNewSelectionBox.classList.add("innernewSelectionBox");
      newSelectionBox.appendChild(innerNewSelectionBox);

      const size = 30;
      const getSelectionBoxCircle = (circleClass: string) => {
        const selectionBoxCircle = document.createElement("span");

        selectionBoxCircle.style.height = size + "px";
        selectionBoxCircle.style.width = size + "px";
        selectionBoxCircle.style.borderRadius = "50%";
        selectionBoxCircle.style.backgroundColor = "red";
        selectionBoxCircle.style.position = "absolute";
        selectionBoxCircle.style.cursor = "col-resize";
        selectionBoxCircle.style.display = "none";
        selectionBoxCircle.classList.add(circleClass);

        return selectionBoxCircle;
      };

      //Right Circle

      const selectionBoxToRightCircle = getSelectionBoxCircle("rightCircle");

      selectionBoxToRightCircle.style.right = -(size / 2) + "px";
      selectionBoxToRightCircle.style.top = "50%";
      selectionBoxToRightCircle.style.transform = "translateY(-50%)";

      const selectionBoxToRightCircleTouchDown = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingRight = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      const selectionBoxToRightCircleTouchUp = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingRight = false;
      };

      //Left Circle
      const selectionBoxToLeftCircle = getSelectionBoxCircle("leftCircle");
      selectionBoxToLeftCircle.style.left = -(size / 2) + "px";
      selectionBoxToLeftCircle.style.top = "50%";
      selectionBoxToLeftCircle.style.transform = "translateY(-50%)";

      const selectionBoxToLeftCircleTouchDown = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingLeft = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      const selectionBoxToLeftCircleTouchUp = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingLeft = false;
      };

      //Top Circle
      const selectionBoxToTopCircle = getSelectionBoxCircle("topCircle");
      selectionBoxToTopCircle.style.top = -(size / 2) + "px";
      selectionBoxToTopCircle.style.left = "50%";
      selectionBoxToTopCircle.style.transform = "translateX(-50%)";

      const selectionBoxToTopCircleTouchDown = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingTop = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      const selectionBoxToTopCircleTouchUp = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingTop = false;
      };
      //

      //Bottom Circle
      const selectionBoxToBottomCircle = getSelectionBoxCircle("bottomCircle");
      selectionBoxToBottomCircle.style.bottom = -(size / 2) + "px";
      selectionBoxToBottomCircle.style.left = "50%";
      selectionBoxToBottomCircle.style.transform = "translateX(-50%)";

      const selectionBoxToBottomCircleTouchDown = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingBottom = true;
        selectionBoxToExpand = newSelectionBox;
        handlePdfPageSelection(event);
      };

      const selectionBoxToBottomCircleTouchUp = (event: any) => {
        event.stopImmediatePropagation();
        isMouseExpandingBottom = false;
      };

      if (!isMobile) {
        // For PC
        // Mouse events
        // Bottom Circle
        selectionBoxToBottomCircle.onmousedown =
          selectionBoxToBottomCircleTouchDown;
        selectionBoxToBottomCircle.onmouseup =
          selectionBoxToBottomCircleTouchUp;
        // Top Circle
        selectionBoxToTopCircle.onmousedown = selectionBoxToTopCircleTouchDown;
        selectionBoxToTopCircle.onmouseup = selectionBoxToTopCircleTouchUp;
        // Left Circle
        selectionBoxToLeftCircle.onmousedown =
          selectionBoxToLeftCircleTouchDown;
        selectionBoxToLeftCircle.onmouseup = selectionBoxToLeftCircleTouchUp;
        // Right Circle
        selectionBoxToRightCircle.onmousedown =
          selectionBoxToRightCircleTouchDown;
        selectionBoxToRightCircle.onmouseup = selectionBoxToRightCircleTouchUp;
      } else {
        // For Mobile
        // Touch events
        // Bottom Circle
        selectionBoxToBottomCircle.ontouchstart =
          selectionBoxToBottomCircleTouchDown;
        selectionBoxToBottomCircle.ontouchcancel =
          selectionBoxToBottomCircleTouchUp;
        // Top Circle
        selectionBoxToTopCircle.ontouchstart = selectionBoxToTopCircleTouchDown;
        selectionBoxToTopCircle.ontouchcancel = selectionBoxToTopCircleTouchUp;
        // Left Circle
        selectionBoxToLeftCircle.ontouchstart =
          selectionBoxToLeftCircleTouchDown;
        selectionBoxToLeftCircle.ontouchcancel =
          selectionBoxToLeftCircleTouchUp;
        // Right Circle
        selectionBoxToRightCircle.ontouchstart =
          selectionBoxToRightCircleTouchDown;
        selectionBoxToRightCircle.ontouchcancel =
          selectionBoxToRightCircleTouchUp;
      }

      innerNewSelectionBox.appendChild(selectionBoxToRightCircle);
      innerNewSelectionBox.appendChild(selectionBoxToLeftCircle);
      innerNewSelectionBox.appendChild(selectionBoxToTopCircle);
      innerNewSelectionBox.appendChild(selectionBoxToBottomCircle);

      return newSelectionBox;
    };

    const fixHorizontalExpansionBreaking = (mousePosY: number) => {
      const selectionBoxToRightCircleRect = selectionBoxToExpand
        .querySelector(".rightCircle")!
        .getBoundingClientRect();

      //The top and bottom of the circle expanding selection box width
      const top = selectionBoxToRightCircleRect.top - pdfPageContainerRect.top;
      const bottom = top + selectionBoxToRightCircleRect.height;

      //Is the mouse position greater than the top or the mouse position less than the bottom of the circle expanding selection box
      const isCursorNotVerticallyIn =
        top - extraSize > mousePosY || bottom + extraSize < mousePosY;

      if (isCursorNotVerticallyIn) isMouseExpandingRight = false;
    };

    const expandSelectionBoxToRight = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Get left of selection box starting from pdf container
      const left = selectionBoxToExpandRect.left - pdfPageContainerRect.left;

      //Getting how far mouse is moving to right, away from selection box
      const deltaX = mousePosX - (left + selectionBoxToExpandRect.width);
      //The current width of the selection box plus how far the mouse is moving to right, away from selection box
      const width = selectionBoxToExpandRect.width + deltaX;

      // Is the position of mouse out of the pdf container greater than the right position of the pdf container
      const isExpandingPassContainerRight =
        mousePosX + pdfPageContainerRect.left > pdfPageContainerRect.right;

      if (!isExpandingPassContainerRight) {
        selectionBoxToExpand.style.width = width + "px";
      }

      fixHorizontalExpansionBreaking(mousePosY);
    };

    const expandSelectionBoxToLeft = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Get left of selection box starting from pdf container
      const left = selectionBoxToExpandRect.left - pdfPageContainerRect.left;

      //Getting how far mouse is moving to left from selection box
      const deltaX = left - mousePosX;
      //The current width of the selection box plus how far the mouse is moving to left, away from selection box
      const width = selectionBoxToExpandRect.width + deltaX;

      const isExpandingPassContainerRight = mousePosX < 0;

      if (!isExpandingPassContainerRight) {
        selectionBoxToExpand.style.width = width + "px";
        selectionBoxToExpand.style.left = mousePosX + "px";
      }

      fixHorizontalExpansionBreaking(mousePosY);
    };

    const fixVerticalExpansionBreaking = (mousePosX: number) => {
      const selectionBoxToRightCircleRect = selectionBoxToExpand
        .querySelector(".topCircle")!
        .getBoundingClientRect();

      const left =
        selectionBoxToRightCircleRect.left - pdfPageContainerRect.left;
      const right = left + selectionBoxToRightCircleRect.width;

      const isCursorNotVerticallyIn =
        left - extraSize > mousePosX || right + extraSize < mousePosX;

      if (isCursorNotVerticallyIn) isMouseExpandingTop = false;
    };

    const expandSelectionBoxToTop = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Getting the top of selection box in pdf container
      const top = selectionBoxToExpandRect.top - pdfPageContainerRect.top;

      //Getting how far mouse is moving away from the top of selection box
      const deltaY = top - mousePosY;
      //The current height of the selection box plus how far the mouse is moving to top, away from selection box
      const height = selectionBoxToExpandRect.height + deltaY;

      //Is mouse expand the top of selection box out of pdf container
      const isExpandingPassContainerTop = mousePosY < 0;
      if (!isExpandingPassContainerTop) {
        selectionBoxToExpand.style.height = height + "px";
        selectionBoxToExpand.style.top = mousePosY + "px";
      }
      fixVerticalExpansionBreaking(mousePosX);
    };

    const expandSelectionBoxToBottom = (event: MouseEvent | any) => {
      if (!selectionBoxToExpand) return;

      const selectionBoxToExpandRect =
        selectionBoxToExpand.getBoundingClientRect();

      const { mousePosX, mousePosY } = getMousePos(event);

      //Getting the top of selection box in pdf container
      const top = selectionBoxToExpandRect.top - pdfPageContainerRect.top;
      //Getting how far mouse is moving to bottom , away from selection box
      const deltaY = mousePosY - (top + selectionBoxToExpandRect.height);
      //The current height of the selection box plus how far the mouse is moving to bottom, away from selection box
      const height = selectionBoxToExpandRect.height + deltaY;

      //TODO
      const bottom = pdfPageContainerRect.bottom;
      // pdfPageContainerRect.height / 18 + pdfPageContainerRect.top;
      //TODO:
      const isExpandingPassContainerBottom =
        mousePosY + pdfPageContainerRect.top > bottom;

      if (!isExpandingPassContainerBottom) {
        selectionBoxToExpand.style.height = height + "px";
      }

      fixVerticalExpansionBreaking(mousePosX);
    };

    const resizeNewSelectionBox = (event: MouseEvent | any) => {
      if (!isMouseDown || !selectionBox) return;

      const { mousePosX, mousePosY } = getMousePos(event);

      const deltaX = mousePosX - startMouseX;
      const deltaY = mousePosY - startMouseY;

      // Width and left
      if (deltaX >= 0) {
        // Dragging right
        selectionBox.style.left = `${startMouseX}px`;
        selectionBox.style.width = `${deltaX}px`;
      } else {
        // Dragging left
        selectionBox.style.left = `${mousePosX}px`;
        selectionBox.style.width = `${-deltaX}px`;
      }

      // Height and top
      if (deltaY >= 0) {
        selectionBox.style.top = `${startMouseY}px`;
        selectionBox.style.height = `${deltaY}px`;
      } else {
        selectionBox.style.top = `${mousePosY}px`;
        selectionBox.style.height = `${-deltaY}px`;
      }
    };

    const handleMouseDown = (event: MouseEvent | any) => {
      if (!selectionBoxMode) return;
      isMouseDown = true;
      document.body.style.overflowY = "hidden";

      handlePdfPageSelection(event);

      if (isMouseExpandingRight) return;

      const { mousePosX, mousePosY } = getMousePos(event);
      selectionBox = createSelectionBox();
      selectionBox.style.position = "absolute";
      selectionBox.style.pointerEvents = "none";
      selectionBox.style.backgroundColor = "rgba(0,255,0,0.3)";
      selectionBox.style.border = "2px solid green";

      startMouseX = mousePosX - selectionBoxStartingSize;
      startMouseY = mousePosY - selectionBoxStartingSize;

      selectionBox.style.left = startMouseX + "px";
      selectionBox.style.top = startMouseY + "px";

      pdfPageContainer.appendChild(selectionBox);
    };

    const handleMouseMove = (event: MouseEvent | any) => {
      if (!selectionBoxMode) return;

      if (isMouseDown) {
        resizeNewSelectionBox(event);
      } else {
        if (isMouseExpandingRight) {
          expandSelectionBoxToRight(event);
        }

        if (isMouseExpandingLeft) {
          expandSelectionBoxToLeft(event);
        }

        if (isMouseExpandingTop) {
          expandSelectionBoxToTop(event);
        }

        if (isMouseExpandingBottom) {
          expandSelectionBoxToBottom(event);
        }
      }
    };

    const getSelectionBoxPartFromCanvas = () => {
      if (!selectionBox || !pdfPageContainer) return;

      const canvas = pdfPageContainer.querySelector("canvas")!;
      const tempCanvas = document.createElement("canvas");

      const selectionBoxRect = selectionBox.getBoundingClientRect();

      const { height, width } = selectionBoxRect;
      tempCanvas.width = width;
      tempCanvas.height = height;

      const tempCtx = tempCanvas.getContext("2d") as CanvasRenderingContext2D;

      const x = selectionBoxRect.x - pdfPageContainerRect.x;
      const y = selectionBoxRect.y - pdfPageContainerRect.y;
      tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

      //document.body.appendChild(tempCanvas);
    };

    const handleMouseLeave = () => {
      if (!selectionBoxMode) return;
      isMouseDown = false;
      document.body.style.overflowY = "auto";
      if (!selectionBox) return;

      //Make other selection box no active
      pdfsContainer
        .querySelectorAll(".selectionBox")
        .forEach((selectionBox) => {
          selectionBox.querySelectorAll("span").forEach((span) => {
            span.style.display = "none";
          });
        });

      //Make the new selection box to be active
      selectionBox.style.pointerEvents = "auto";
      selectionBox.style.cursor = "move";
      selectionBox.querySelectorAll("span").forEach((span) => {
        span.style.display = "initial";
      });

      selectionBox = undefined;
    };

    const handleMouseUp = () => {
      if (!selectionBoxMode) return;
      resetExpansionState();
      getSelectionBoxPartFromCanvas();
      handleMouseLeave();
    };

    const handleMouseOut = () => {
      if (!selectionBoxMode) return;
      handleMouseLeave();
    };

    if (!isMobile) {
      // Mouse events for PC
      pdfsContainer.addEventListener("mousedown", handleMouseDown);
      pdfsContainer.addEventListener("mousemove", handleMouseMove);
      pdfsContainer.addEventListener("mouseup", handleMouseUp);
      pdfsContainer.addEventListener("mouseout", handleMouseOut);
    } else {
      // Touch events for Mobile
      pdfsContainer.addEventListener("touchstart", handleMouseDown);
      pdfsContainer.addEventListener("touchmove", handleMouseMove);
      pdfsContainer.addEventListener("touchcancel", handleMouseUp);
      pdfsContainer.addEventListener("touchend", handleMouseOut);
    }

    return () => {
      if (!isMobile) {
        // Remove Mouse events for PC
        pdfsContainer.removeEventListener("mousedown", handleMouseDown);
        pdfsContainer.removeEventListener("mousemove", handleMouseMove);
        pdfsContainer.removeEventListener("mouseup", handleMouseUp);
        pdfsContainer.removeEventListener("mouseout", handleMouseOut);
      } else {
        // Remove Touch events for Mobile
        pdfsContainer.removeEventListener("touchstart", handleMouseDown);
        pdfsContainer.removeEventListener("touchmove", handleMouseMove);
        pdfsContainer.removeEventListener("touchcancel", handleMouseUp);
        pdfsContainer.removeEventListener("touchend", handleMouseOut);
      }
    };
  }, [divRef.current, selectionBoxMode]);
};

export default useDrawRectangle;
