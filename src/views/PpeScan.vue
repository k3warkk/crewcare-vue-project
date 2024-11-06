<template>
    <div>
        <router-link to="/"><button>Home</button></router-link>
        <h2>Webcam Feed</h2>
        <video ref="video" autoplay playsinline></video>

        <!-- Buttons for capturing image and stopping webcam -->
        <div>
            <button @click="captureImage">Capture Image</button>
            <button @click="stopWebcam">Stop Webcam</button>
        </div>

        <!-- Display the captured image -->
        <div v-if="capturedImage">
            <h3>Captured Image:</h3>
            <img :src="capturedImage" alt="Captured" />
            <button @click="processImage">Process Image</button>
        </div>

        <!-- Display detection results -->
        <div v-if="processedImage">
            <h3>Processed Image with Bounding Boxes:</h3>
            <img :src="processedImage" alt="Processed" />
        </div>
    </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "../axios.js";
import axios5000 from "../axios5000.js";

export default {
    setup() {
        const video = ref(null);
        const stream = ref(null);
        const capturedImage = ref("");
        const processedImage = ref("");

        const router = useRoute();
        const permitId = router.query.permit_id;
        const crewId = router.query.crew_id;

        onMounted(async () => {
            try {
                stream.value = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                video.value.srcObject = stream.value;
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        });

        onUnmounted(() => {
            stopWebcam();
        });

        const stopWebcam = () => {
            if (stream.value) {
                stream.value.getTracks().forEach((track) => track.stop());
                stream.value = null;
            }
        };

        const captureImage = () => {
            if (!video.value) return;

            const canvas = document.createElement("canvas");
            canvas.width = video.value.videoWidth;
            canvas.height = video.value.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video.value, 0, 0, canvas.width, canvas.height);

            capturedImage.value = canvas.toDataURL("image/png");
        };

        const processImage = async () => {
            // Required items for initial check and secondary check
            const initialRequiredItems = ["helmet"];
            const secondaryRequiredItems = ["helmet", "goggles", "gloves"];

            // Set to track detected items
            const detectedItems = new Set();

            try {
                // Step 1: Check for initial required items (overalls and shoes)
                for (const modelType of initialRequiredItems) {
                    const response = await axios5000.post("/process-image", {
                        image: capturedImage.value,
                        model_type: modelType,
                    });

                    processedImage.value = response.data.image;
                    const results = response.data.results;
                    results.forEach((item) => {
                        detectedItems.add(item.label);
                    });

                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Display delay for image

                    // Check if both overalls and shoes are detected
                    const allInitialDetected = initialRequiredItems.every(
                        (item) => detectedItems.has(item)
                    );

                    if (!allInitialDetected) {
                        console.log("Overalls or shoes not detected.");
                        return; // Exit if any initial required items are missing
                    }
                }

                // Step 2: Check for secondary required items (helmet, goggles, gloves)
                for (const modelType of secondaryRequiredItems) {
                    const response = await axios5000.post("/process-image", {
                        image: capturedImage.value,
                        model_type: modelType,
                    });

                    processedImage.value = response.data.image;
                    const results = response.data.results;
                    results.forEach((item) => {
                        detectedItems.add(item.label);
                    });

                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Display delay for image
                }

                // Identify missing items from the secondary check
                const missingItems = secondaryRequiredItems.filter(
                    (item) => !detectedItems.has(item)
                );

                if (missingItems.length === 0) {
                    console.log(
                        "All PPE items detected. Proceeding to verify..."
                    );
                    await verifyPermit(); // Proceed with verification if all items are detected
                } else if (
                    missingItems.length === 1 ||
                    missingItems.length === 2
                ) {
                    console.log("Missing items:", missingItems);
                    await activateMotors(missingItems); // Activate motors for missing items
                    //await processImage(); // Restart process after activating motors
                } else {
                    console.log("Multiple items missing, verification failed.");
                    return; // Exit if more than two items are missing
                }
            } catch (error) {
                console.error("Error processing image:", error);
            }
        };

        // Function to activate motors based on missing items
        const activateMotors = async (missingItems) => {
            // Map each item to a motor ID
            const motorMapping = {
                helmet: 1,
                goggles: 2,
                gloves: 3,
            };

            try {
                // Loop through missing items and trigger the motor for each
                for (const item of missingItems) {
                    const motorId = motorMapping[item];
                    if (motorId) {
                        await axios.post("/trigger-motor", {
                            motor_id: motorId,
                        });
                        console.log(
                            `Activated motor for ${item} with ID: ${motorId}`
                        );
                    } else {
                        console.log(`No motor ID found for ${item}`);
                    }
                }
            } catch (error) {
                console.error("Error activating motors:", error);
            }
        };

        // Function to verify a permit
        const verifyPermit = async () => {
            try {
                await axios.post(
                    `/job-permits/${permitId}/crew/${crewId}/verify`
                );
            } catch (error) {
                console.error("Error verifying job permit:", error);
            }
        };

        return {
            video,
            capturedImage,
            processedImage,
            stopWebcam,
            captureImage,
            processImage,
        };
    },
};
</script>

<style>
video {
    width: 100%;
    max-width: 600px;
    border: 2px solid #333;
    margin-top: 10px;
}

img {
    max-width: 100%;
    margin-top: 10px;
}
</style>
