import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import axios from "axios";
import { useRouter } from "next/navigation";
import DialogContentText from "@mui/material/DialogContentText";
import { Button } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import { toast } from "react-toastify";
const TalkToUs=({open, setOpen}: any)=>{
    const router = useRouter();
    const handleClose = () => {
        setOpen(false);
      };
    
    return(
        <Dialog
                      open={open}
                      onClose={handleClose}
                      PaperProps={{
                        component: "form",
                        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          const formJson = Object.fromEntries(
                            (formData as any).entries()
                          );

                         
                          try {
                            const response = await axios.post('/api/slack', formJson, {
                              headers: {
                                'Content-Type': 'application/json',
                              }},);
                            if (response.status !== 200) {
                              toast.error('There was an error in submitting your details.')
                            } 
                            router.push(
                              `https://calendly.com/finigami/demo?name=${formJson.name}&email=${formJson.email}`
                            );
                            handleClose();
                          } catch (error) {
                            toast.error('There was an error in submitting your details. Please try again.')
                          }

                        },
                      }}
                    >
                      <DialogTitle>Talk to us</DialogTitle>
                      <DialogContent>
                        <TextField
                          autoFocus
                          required
                          margin="dense"
                          id="name"
                          name="name"
                          label="Your name"
                          type="text"
                          fullWidth
                          variant="standard"
                        />
                        <TextField
                          autoFocus
                          required
                          margin="dense"
                          id="email"
                          name="email"
                          label="Your email"
                          type="email"
                          fullWidth
                          variant="standard"
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button type="submit" variant="contained">
                          Submit
                        </Button>
                      </DialogActions>
                    </Dialog>
    )
}

export default TalkToUs