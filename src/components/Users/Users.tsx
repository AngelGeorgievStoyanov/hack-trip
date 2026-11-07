import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Container, Grid, Typography } from "@mui/material";
import { User } from "../../model/users";
import { IdType } from "../../shared/common-types";
import * as userService from "../../services/userService";
import { ApiClient } from "../../services/userService";
import * as tripService from "../../services/tripService";
import { Trip } from "../../model/trip";
import { ApiTrip } from "../../services/tripService";

const API_CLIENT: ApiClient<IdType, User> = new userService.ApiClientImpl<IdType, User>("users");
const API_TRIP: ApiTrip<IdType, Trip> = new tripService.ApiTripImpl<IdType, Trip>("data");

type VerificationStatus = "loading" | "success" | "error";

const Users: FC = () => {
    const { userId, token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [imageBackground, setImageBackground] = useState<string>();

    useEffect(() => {
        API_TRIP.backgroundImages()
            .then((images) => {
                if (images.length > 0) {
                    setImageBackground(images[Math.floor(Math.random() * images.length)]);
                }
            })
            .catch((error) => console.error(error));
    }, []);

    useEffect(() => {
        if (!userId || !token) {
            setStatus("error");
            return;
        }

        let isActive = true;

        API_CLIENT.verifyEmail(userId, token)
            .then((isVerified) => {
                if (isActive) {
                    if (isVerified && typeof BroadcastChannel !== "undefined") {
                        const channel = new BroadcastChannel("hack-trip-email-verification");
                        channel.postMessage({ type: "EMAIL_VERIFIED" });
                        channel.close();
                    }

                    setStatus(isVerified ? "success" : "error");
                }
            })
            .catch((error) => {
                console.error(error);
                if (isActive) {
                    setStatus("error");
                }
            });

        return () => {
            isActive = false;
        };
    }, [userId, token]);

    useEffect(() => {
        if (status !== "success") {
            return;
        }

        const redirectTimer = window.setTimeout(() => navigate("/login"), 4000);
        return () => window.clearTimeout(redirectTimer);
    }, [status, navigate]);

    return (
        <Grid
            container
            sx={{
                minHeight: "100vh",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                px: 2,
                py: 5,
                backgroundImage: imageBackground
                    ? `url(https://storage.googleapis.com/hack-trip-background-images/${imageBackground})`
                    : "linear-gradient(135deg, #17324d 0%, #315b70 50%, #172b43 100%)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
            }}
        >
            <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography
                    component="h1"
                    sx={{
                        mb: 3,
                        color: "#fff",
                        fontFamily: "Space Mono, monospace",
                        fontWeight: 700,
                        textShadow: "3px 3px 5px rgba(0,0,0,0.85)",
                    }}
                    variant="h4"
                >
                    Welcome to Hack Trip!
                </Typography>

                <Box
                    sx={{
                        width: "100%",
                        boxSizing: "border-box",
                        p: { xs: 3, sm: 4 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2.5,
                        color: "#fff",
                        backgroundColor: "rgba(20, 31, 43, 0.82)",
                        border: "1px solid rgba(255,255,255,0.35)",
                        boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
                        borderRadius: 2,
                    }}
                >
                    {status === "loading" && (
                        <>
                            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                                VERIFYING YOUR EMAIL
                            </Typography>
                            <Typography sx={{ color: "#fff" }}>
                                Please wait while we confirm your email address...
                            </Typography>
                    </>
                    )}

                    {status === "success" && (
                        <>
                            <Alert severity="success" sx={{ width: "100%", textAlign: "left" }}>
                                Your email address has been successfully verified.
                            </Alert>
                            <Typography sx={{ color: "#fff" }}>
                                You will be redirected to the login page in a few seconds.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate("/login")}
                                sx={{
                                    mt: 1,
                                    minWidth: 190,
                                    py: 1.2,
                                    px: 3,
                                    fontWeight: 700,
                                    textTransform: "none",
                                    borderRadius: 1.5,
                                    backgroundColor: "#4daf30",
                                    boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                                    "&:hover": { backgroundColor: "#3d9226", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" },
                                }}
                            >
                                Continue to Login
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <Alert severity="error" sx={{ width: "100%", textAlign: "left" }}>
                                We couldn't verify your email address. The link may be invalid or expired.
                            </Alert>
                            <Button
                                variant="contained"
                                onClick={() => navigate("/register")}
                                sx={{
                                    mt: 1,
                                    minWidth: 190,
                                    py: 1.2,
                                    px: 3,
                                    fontWeight: 700,
                                    textTransform: "none",
                                    borderRadius: 1.5,
                                    backgroundColor: "#4daf30",
                                    "&:hover": { backgroundColor: "#3d9226" },
                                }}
                            >
                                Back to Register
                            </Button>
                        </>
                    )}
                </Box>
            </Container>
        </Grid>
    );
};

export default Users;
